kite         = KD.getSingleton "kiteController"
{nickname}   = KD.whoami().profile
appStorage = new AppStorage "kodularjs-installer", "1.0"

class InstallPane extends KodularJSPane

  constructor:->

    super

    @form = new KDFormViewWithFields
      callback              : @bound "installAngularJS"
      buttons               :
        install             :
          title             : "Create AngularJS app"
          style             : "cupid-green"
          type              : "submit"
          loader            :
            color           : "#444444"
            diameter        : 12
      fields                :
        name                :
          label             : "Name of AngularJS App:"
          name              : "name"
          placeholder       : "type a name for your app..."
          defaultValue      : "my_angularjs_app"
          validate          :
            rules           :
              required      : "yes"
              regExp        : /(^$)|(^[a-z\d]+([_][a-z\d]+)*$)/i
            messages        :
              required      : "a name for your angularjs app is required!"
          nextElement       :
            timestamp       :
              name          : "timestamp"
              type          : "hidden"
              defaultValue  : Date.now()
        domain              :
          label             : "Domain :"
          name              : "domain"
          itemClass         : KDSelectBox
          defaultValue      : "#{nickname}.kd.io"
        angularjsversion    :
          label             : "AngularJS Version :"
          name              : "angularjsversion"
          itemClass         : KDSelectBox
          defaultValue      : "1.0.3"

    @form.on "FormValidationFailed", => @form.buttons["Create AngularJS app"].hideLoader()

    vmc = KD.getSingleton 'vmController'

    vmc.fetchVMs (err, vms)=>
      if err then console.log err
      else
        vms.forEach (vm) =>
          vmc.fetchVMDomains vm, (err, domains) =>
            newSelectOptions = []
            usableDomains = [domain for domain in domains when not /^(vm|shared)-[0-9]/.test domain].first
            usableDomains.forEach (domain) =>
              newSelectOptions.push {title : domain, value : domain}

            {domain} = @form.inputs
            domain.setSelectOptions newSelectOptions
        

    newVersionOptions = []
    #newVersionOptions.push {title : "Latest (git)", value : "git"}
    newVersionOptions.push {title : "1.0.3 (stable)", value : "1.0.3"}

    {angularjsversion} = @form.inputs
    angularjsversion.setSelectOptions newVersionOptions

  completeInputs:(fromPath = no)->

    {path, name, pathExtension} = @form.inputs
    if fromPath
      val  = path.getValue()
      slug = KD.utils.slugify val
      path.setValue val.replace('/', '') if /\//.test val
    else
      slug = KD.utils.slugify name.getValue()
      path.setValue slug

    slug += "/" if slug

    pathExtension.inputLabel.updateTitle "/#{slug}"

  checkPath: (name, callback)->
    instancesDir = "kodularjs"

    kite.run "[ -d /home/#{nickname}/#{instancesDir}/#{name} ] && echo 'These directories exist'"
    , (err, response)->
      if response
        console.log "You have already a AngularJS app with the name \"#{name}\". Please delete it or choose another path"
      callback? err, response

  showInstallFail: ->
    new KDNotificationView
        title     : "AngularJS app exists already. Please delete it or choose another name"
        duration  : 3000

  installAngularJS: =>
    domain = @form.inputs.domain.getValue()
    name = @form.inputs.name.getValue()
    angularjsversion = @form.inputs.angularjsversion.getValue()
    timestamp = parseInt @form.inputs.timestamp.getValue(), 10


    console.log "ANGULARJS VERSION", angularjsversion
    @checkPath name, (err, response)=>
      if err # means there is no such folder
        console.log "Starting install with formData", @form

        #If you change it, grep the source file because this variable is used
        instancesDir = "/home/#{nickname}/kodularjs"
        webDir = "/home/#{nickname}/Web/kodularjs/#{name}"
        tmpAppDir = "#{instancesDir}/tmp"

        kite.run "mkdir -p '#{tmpAppDir}'", (err, res)=>
          if err then console.log err
          else
            kodularjsScript = """
                          #!/bin/bash
                          echo "Grabbing the AngularJS boilerplate project"
                          git clone -q git://github.com/joshdmiller/ng-boilerplate "#{instancesDir}/#{name}"
                          cd "#{instancesDir}/#{name}"
                          git checkout -b master
                          
                          echo "Checking for grunt (configuration management)"
                          [ `which grunt` ] || sudo npm -g --loglevel warn install grunt-cli
                          echo "Checking for karma (unit testing)"
                          [ `which karma` ] || sudo npm -g --loglevel warn install karma
                          echo "Checking for bower (package management)"
                          [ `which bower` ] || sudo npm -g --loglevel warn install bower
                          sudo chown -R #{nickname}:#{nickname} `npm -g config get tmp`
                          
                          echo "Installing boilerplate dependencies"
                          npm --loglevel warn install
                          npm cache clean
                          bower --quiet cache clean
                          bower --quiet install
                          
                          # use phantomjs by default, because this environment is headless
                          mv karma/karma-unit.tpl.js karma/karma-unit.tpl.js.bak
                          sed "s/'Firefox'/'PhantomJS'/" karma/karma-unit.tpl.js.bak > karma/karma-unit.tpl.js
                          rm karma/karma-unit.tpl.js.bak
                          
                          # move the compile dir to the web root
                          mv build.config.js build.config.js.bak
                          sed "s,compile_dir: 'bin',compile_dir: '#{webDir}'," build.config.js.bak > build.config.js
                          rm build.config.js.bak
                          
                          # commit config changes
                          git commit -am "modify config for kodularjs"
                          
                          echo "Setting up the first build"
                          grunt clean html2js jshint coffeelint coffee recess:build concat:build_css copy index:build compile
                          
                          echo -e '\nNew AngularJS project "#{name}" created:'
                          echo -e '  Source directory : #{instancesDir}/#{name}'
                          echo -e '  Web directory    : #{webDir}'
                          echo -e '  Web address      : http://#{nickname}.kd.io/kodularjs/#{name}\n'
                          """

            newFile = FSHelper.createFile
              type   : 'file'
              path   : "#{tmpAppDir}/kodularjsScript.sh"
              vmName : @vmName

            newFile.save kodularjsScript, (err, res)=>
              if err then warn err
              else
                @emit "fs.saveAs.finished", newFile, @

            installCmd = "bash #{tmpAppDir}/kodularjsScript.sh && rm -rf #{tmpAppDir}\n"
            formData = {timestamp: timestamp, domain: domain, name: name, angularjsversion: angularjsversion}

            modal = new ModalViewWithTerminal
              title   : "Creating AngularJS App: '#{name}'"
              width   : 700
              overlay : no
              terminal:
                height: 500
                command: installCmd
                hidden: no
              content : """
                        <div class='modalformline'>
                          <p>Using AngularJS <strong>#{angularjsversion}</strong></p>
                          <br>
                          <i>note: your sudo password is your koding password. </i>
                        </div>
                        """

            @form.buttons.install.hideLoader()
            appStorage.fetchValue 'blogs', (blogs)->
              blogs or= []
              blogs.push formData
              appStorage.setValue "blogs", blogs

            @emit "AngularJSInstalled", formData

      else # there is a folder on the same path so fail.
        @form.buttons.install.hideLoader()
        @showInstallFail()

  pistachio:-> "{{> this.form}}"

