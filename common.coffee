class KodularJSApp extends JView

  constructor:->

    super

    @listenWindowResize()

    @dashboardTabs = new KDTabView
      hideHandleCloseIcons : yes
      hideHandleContainer  : yes
      cssClass             : "kodularjs-installer-tabs"

    @buttonGroup = new KDButtonGroupView
      buttons       :
        "Dashboard" :
          cssClass  : "clean-gray toggle"
          callback  : => @dashboardTabs.showPaneByIndex 0
        "Create a new AngularJS app" :
          cssClass  : "clean-gray"
          callback  : => @dashboardTabs.showPaneByIndex 1

    @dashboardTabs.on "PaneDidShow", (pane)=>
      if pane.name is "dashboard"
        @buttonGroup.buttonReceivedClick @buttonGroup.buttons.Dashboard
      else
        @buttonGroup.buttonReceivedClick @buttonGroup.buttons["Create a new AngularJS app"]

  viewAppended:->

    super

    @dashboardTabs.addPane dashboard = new DashboardPane
      cssClass : "dashboard"
      name     : "dashboard"

    @dashboardTabs.addPane installPane = new InstallPane
      name     : "install"

    @dashboardTabs.showPane dashboard

    installPane.on "AngularJSInstalled", (formData)->
      dashboard.putNewItem formData, no

    @_windowDidResize()

  _windowDidResize:->

    @dashboardTabs.setHeight @getHeight() - @$('>header').height()

  pistachio:->

    """
    <header>
      <figure></figure>
      <article>
        <h3>KodularJS</h3>
        <p>This application installs AngularJS starter applications.</p>
        <p>You can maintain all your AngularJS apps via the dashboard.</p>
      </article>
      <section>
      {{> @buttonGroup}}
      </section>
    </header>
    {{> @dashboardTabs}}
    """

class KodularJSSplit extends KDSplitView

  constructor:(options, data)->

    @output = new KDScrollView
      tagName  : "pre"
      cssClass : "terminal-screen"

    @kodularjsapp = new KodularJSApp

    options.views = [ @kodularjsapp, @output ]

    super options, data

  viewAppended:->

    super

    @panels[1].setClass "terminal-tab"

class KodularJSPane extends KDTabPaneView

  viewAppended:->

    @setTemplate @pistachio()
    @template.update()
