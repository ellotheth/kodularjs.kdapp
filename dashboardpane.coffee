class DashboardPane extends KodularJSPane

  constructor:->

    super

    @listController = new KDListViewController
      lastToFirst     : yes
      viewOptions     :
        type          : "kodularjs-blog"
        itemClass     : KodularJSInstalledAppListItem

    @listWrapper = @listController.getView()

    @notice = new KDCustomHTMLView
      tagName : "p"
      cssClass: "why-u-no"
      partial : "You don't have any AngularJS apps installed."

    @notice.hide()

    @loader = new KDLoaderView
      size          :
        width       : 60
      cssClass      : "loader"
      loaderOptions :
        color       : "#ccc"
        diameter    : 30
        density     : 30
        range       : 0.4
        speed       : 1
        FPS         : 24

    @listController.getListView().on "StartTerminal", (listItemView)=>
      {timestamp, domain, name, angularjsversion} = listItemView.getData()

      instancesDir = "kodularjs"

      instanceDir = "/home/#{nickname}/#{instancesDir}/#{name}"
      kodularjsCmd = "cd #{instanceDir} && clear"

      modal = new ModalViewWithTerminal
        title   : "KodularJS Terminal"
        width   : 700
        overlay : no
        terminal:
          height: 500
          command: kodularjsCmd
          hidden: no
        content : """
                  <div class='modalformline'>
                    <p>Running from <strong>#{instanceDir}</strong>.</p>
                    <p>Using AngularJS <strong>#{angularjsversion}</strong></p>
                  </div>
                  """
      modal.on "terminal.event", (data)->
        new KDNotificationView
          title: "Opened successfuly"

    @listController.getListView().on "StartGrunt", (listItemView)=>
      {timestamp, domain, name, angularjsversion} = listItemView.getData()
      instancesDir = "kodularjs"
      instanceDir = "/home/#{nickname}/#{instancesDir}/#{name}"
      kodularjsCmd = "cd #{instanceDir} && grunt --force"

      modal = new ModalViewWithTerminal
        title   : "Publishing #{name} with Grunt"
        width   : 700
        overlay : no
        terminal:
          height: 500
          command: kodularjsCmd
          hidden: no
        content : """
                  <div class='modalformline'>
                    <p>Running from <strong>#{instanceDir}</strong>.</p>
                    <p>Using AngularJS <strong>#{angularjsversion}</strong></p>
                  </div>
                  """
        buttons :
          Visit:
            title: "open http://#{domain}/#{instancesDir}/#{name}"
            cssClass: "modal-clean-green"
            callback: =>
              @openInNewTab "http://#{domain}/#{instancesDir}/#{name}"

      modal.on "terminal.event", (data)->
        new KDNotificationView
          title: "Started successfully!"

    @listController.getListView().on "DeleteLinkClicked", (listItemView)=>
      {domain, name} = listItemView.getData()

      instancesDir = "kodularjs"
      message = "<pre>/home/#{nickname}/#{instancesDir}/#{name}</pre>"
      command = "rm -rf '/home/#{nickname}/Web/#{instancesDir}/#{name}' '/home/#{nickname}/#{instancesDir}/#{name}'"
      warning = "Warning: Deleting '#{name}' will remove these directories:"

      modal = new KDModalView
        title          : "Are you sure want to delete AngularJS app '#{name}'?"
        content        : """
                          <div class='modalformline'>
                            <p style='color:red'>
                                #{warning}
                            </p>
                            <pre>
                            /home/#{nickname}/#{instancesDir}/#{name}
                            /home/#{nickname}/Web/#{instancesDir}/#{name}</pre>
                          </div>
                         """
        height         : "auto"
        overlay        : yes
        width          : 500
        buttons        :
          Delete       :
            style      : "modal-clean-red"
            loader     :
              color    : "#ffffff"
              diameter : 16
            callback   : =>
              @removeItem listItemView
              KD.getSingleton("kiteController").run command, (err, res)=>
                modal.buttons.Delete.hideLoader()
                modal.destroy()
                if err
                  console.log "Deleting Angularjs Error", err
                  new KDNotificationView
                    title    : "There was an error, you may need to remove it manually!"
                    duration : 3333
                else
                  new KDNotificationView
                    title    : "Your AngularJS app: '#{name}' is successfully deleted."
                    duration : 3333

  openInNewTab: (url)->
    link = document.createElement "a"
    link.href = link.target = url
    link.style.display = "none"
    document.body.appendChild link
    link.click()
    link.parentNode.removeChild link
  
  removeItem:(listItemView)->

    blogs = appStorage.getValue "blogs"
    blogToDelete = listItemView.getData()
    blogs.splice blogs.indexOf(blogToDelete), 1
    
    appStorage.setValue "blogs", blogs, =>
      @listController.removeItem listItemView
      appStorage.fetchValue "blogs", (blogs)=>
        blogs?=[]
        @notice.show() if blogs.length is 0

  putNewItem:(formData, resizeSplit = yes)->

    tabs = @getDelegate()
    tabs.showPane @
    @listController.addItem formData
    @notice.hide()
    if resizeSplit
      @utils.wait 1500, -> split.resizePanel 0, 1

  viewAppended:->

    super

    @loader.show()

    appStorage.fetchStorage (storage)=>
      @loader.hide()
      blogs = appStorage.getValue("blogs") or []
      if blogs.length > 0
        blogs.sort (a, b) -> if a.timestamp < b.timestamp then -1 else 1
        blogs.forEach (item)=> @putNewItem item, no
      else
        @notice.show()

  pistachio:->
    """
    {{> @loader}}
    {{> @notice}}
    {{> @listWrapper}}
    """

class KodularJSInstalledAppListItem extends KDListItemView

  constructor:(options, data)->

    options.type = "kodularjs-blog"

    super options, data

    @terminalButton = new KDButtonView
      cssClass   : "clean-gray test-input"
      title      : "Open terminal"
      callback   : => @getDelegate().emit "StartTerminal", @

    @serverButton = new KDButtonView
      cssClass   : "kodularjs-button cupid-green clean-gray test-input"
      title      : "Publish #{data.name}"
      callback   : => @getDelegate().emit "StartGrunt", @

    @delete = new KDCustomHTMLView
      tagName : "a"
      cssClass: "delete-link"
      click   : => @getDelegate().emit "DeleteLinkClicked", @

  viewAppended:->

    @setTemplate @pistachio()
    @template.update()
    @utils.wait => @setClass "in"

  pistachio:->
    {path, timestamp, domain, name, angularjsversion} = @getData()
    instancesDir = "kodularjs"
    url = "https://#{domain}/#{instancesDir}/#{name}"
    {nickname} = KD.whoami().profile
    """
    {{> @delete}}
    <a target='_blank' class='name-link' href='#{url}'> {{#(name)}} </a>
    <div class="instance-block">
        KodularJS Project Path: /home/#{nickname}/#{instancesDir}/{{#(name)}}
        <br />
        KodularJS Web Path: /home/#{nickname}/Web/#{instancesDir}/{{#(name)}}
        <br />
        AngularJS Version: {{#(angularjsversion)}}
        <br />
        {{> @terminalButton}}   {{> @serverButton}}
    </div>
    <time datetime='#{new Date(timestamp)}'>#{$.timeago new Date(timestamp)}</time>
    """

