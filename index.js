/* Compiled by kdc on Mon Dec 23 2013 07:17:27 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/gemma/Applications/kodularjs.kdapp/common.coffee */
var KodularJSApp, KodularJSPane, KodularJSSplit, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KodularJSApp = (function(_super) {
  __extends(KodularJSApp, _super);

  function KodularJSApp() {
    var _this = this;
    KodularJSApp.__super__.constructor.apply(this, arguments);
    this.listenWindowResize();
    this.dashboardTabs = new KDTabView({
      hideHandleCloseIcons: true,
      hideHandleContainer: true,
      cssClass: "kodularjs-installer-tabs"
    });
    this.buttonGroup = new KDButtonGroupView({
      buttons: {
        "Dashboard": {
          cssClass: "clean-gray toggle",
          callback: function() {
            return _this.dashboardTabs.showPaneByIndex(0);
          }
        },
        "Create a new AngularJS app": {
          cssClass: "clean-gray",
          callback: function() {
            return _this.dashboardTabs.showPaneByIndex(1);
          }
        }
      }
    });
    this.dashboardTabs.on("PaneDidShow", function(pane) {
      if (pane.name === "dashboard") {
        return _this.buttonGroup.buttonReceivedClick(_this.buttonGroup.buttons.Dashboard);
      } else {
        return _this.buttonGroup.buttonReceivedClick(_this.buttonGroup.buttons["Create a new AngularJS app"]);
      }
    });
  }

  KodularJSApp.prototype.viewAppended = function() {
    var dashboard, installPane;
    KodularJSApp.__super__.viewAppended.apply(this, arguments);
    this.dashboardTabs.addPane(dashboard = new DashboardPane({
      cssClass: "dashboard",
      name: "dashboard"
    }));
    this.dashboardTabs.addPane(installPane = new InstallPane({
      name: "install"
    }));
    this.dashboardTabs.showPane(dashboard);
    installPane.on("AngularJSInstalled", function(formData) {
      return dashboard.putNewItem(formData, false);
    });
    return this._windowDidResize();
  };

  KodularJSApp.prototype._windowDidResize = function() {
    return this.dashboardTabs.setHeight(this.getHeight() - this.$('>header').height());
  };

  KodularJSApp.prototype.pistachio = function() {
    return "<header>\n  <figure></figure>\n  <article>\n    <h3>KodularJS</h3>\n    <p>This application installs AngularJS starter applications.</p>\n    <p>You can maintain all your AngularJS apps via the dashboard.</p>\n  </article>\n  <section>\n  {{> this.buttonGroup}}\n  </section>\n</header>\n{{> this.dashboardTabs}}";
  };

  return KodularJSApp;

})(JView);

KodularJSSplit = (function(_super) {
  __extends(KodularJSSplit, _super);

  function KodularJSSplit(options, data) {
    this.output = new KDScrollView({
      tagName: "pre",
      cssClass: "terminal-screen"
    });
    this.kodularjsapp = new KodularJSApp;
    options.views = [this.kodularjsapp, this.output];
    KodularJSSplit.__super__.constructor.call(this, options, data);
  }

  KodularJSSplit.prototype.viewAppended = function() {
    KodularJSSplit.__super__.viewAppended.apply(this, arguments);
    return this.panels[1].setClass("terminal-tab");
  };

  return KodularJSSplit;

})(KDSplitView);

KodularJSPane = (function(_super) {
  __extends(KodularJSPane, _super);

  function KodularJSPane() {
    _ref = KodularJSPane.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KodularJSPane.prototype.viewAppended = function() {
    this.setTemplate(this.pistachio());
    return this.template.update();
  };

  return KodularJSPane;

})(KDTabPaneView);
/* BLOCK STARTS: /home/gemma/Applications/kodularjs.kdapp/dashboardpane.coffee */
var DashboardPane, KodularJSInstalledAppListItem,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

DashboardPane = (function(_super) {
  __extends(DashboardPane, _super);

  function DashboardPane() {
    var _this = this;
    DashboardPane.__super__.constructor.apply(this, arguments);
    this.listController = new KDListViewController({
      lastToFirst: true,
      viewOptions: {
        type: "kodularjs-blog",
        itemClass: KodularJSInstalledAppListItem
      }
    });
    this.listWrapper = this.listController.getView();
    this.notice = new KDCustomHTMLView({
      tagName: "p",
      cssClass: "why-u-no",
      partial: "You don't have any AngularJS apps installed."
    });
    this.notice.hide();
    this.loader = new KDLoaderView({
      size: {
        width: 60
      },
      cssClass: "loader",
      loaderOptions: {
        color: "#ccc",
        diameter: 30,
        density: 30,
        range: 0.4,
        speed: 1,
        FPS: 24
      }
    });
    this.listController.getListView().on("StartTerminal", function(listItemView) {
      var angularjsversion, domain, instanceDir, instancesDir, kodularjsCmd, modal, name, timestamp, _ref;
      _ref = listItemView.getData(), timestamp = _ref.timestamp, domain = _ref.domain, name = _ref.name, angularjsversion = _ref.angularjsversion;
      instancesDir = "kodularjs";
      instanceDir = "/home/" + nickname + "/" + instancesDir + "/" + name;
      kodularjsCmd = "cd " + instanceDir + " && clear";
      modal = new ModalViewWithTerminal({
        title: "KodularJS Terminal",
        width: 700,
        overlay: false,
        terminal: {
          height: 500,
          command: kodularjsCmd,
          hidden: false
        },
        content: "<div class='modalformline'>\n  <p>Running from <strong>" + instanceDir + "</strong>.</p>\n  <p>Using AngularJS <strong>" + angularjsversion + "</strong></p>\n</div>"
      });
      return modal.on("terminal.event", function(data) {
        return new KDNotificationView({
          title: "Opened successfuly"
        });
      });
    });
    this.listController.getListView().on("StartGrunt", function(listItemView) {
      var angularjsversion, domain, instanceDir, instancesDir, kodularjsCmd, modal, name, timestamp, _ref;
      _ref = listItemView.getData(), timestamp = _ref.timestamp, domain = _ref.domain, name = _ref.name, angularjsversion = _ref.angularjsversion;
      instancesDir = "kodularjs";
      instanceDir = "/home/" + nickname + "/" + instancesDir + "/" + name;
      kodularjsCmd = "cd " + instanceDir + " && grunt --force";
      modal = new ModalViewWithTerminal({
        title: "Publishing " + name + " with Grunt",
        width: 700,
        overlay: false,
        terminal: {
          height: 500,
          command: kodularjsCmd,
          hidden: false
        },
        content: "<div class='modalformline'>\n  <p>Running from <strong>" + instanceDir + "</strong>.</p>\n  <p>Using AngularJS <strong>" + angularjsversion + "</strong></p>\n</div>",
        buttons: {
          Visit: {
            title: "open http://" + domain + "/" + instancesDir + "/" + name,
            cssClass: "modal-clean-green",
            callback: function() {
              return _this.openInNewTab("http://" + domain + "/" + instancesDir + "/" + name);
            }
          }
        }
      });
      return modal.on("terminal.event", function(data) {
        return new KDNotificationView({
          title: "Started successfully!"
        });
      });
    });
    this.listController.getListView().on("DeleteLinkClicked", function(listItemView) {
      var command, domain, instancesDir, message, modal, name, warning, _ref;
      _ref = listItemView.getData(), domain = _ref.domain, name = _ref.name;
      instancesDir = "kodularjs";
      message = "<pre>/home/" + nickname + "/" + instancesDir + "/" + name + "</pre>";
      command = "rm -rf '/home/" + nickname + "/Web/" + instancesDir + "/" + name + "' '/home/" + nickname + "/" + instancesDir + "/" + name + "'";
      warning = "Warning: Deleting '" + name + "' will remove these directories:";
      return modal = new KDModalView({
        title: "Are you sure want to delete AngularJS app '" + name + "'?",
        content: "<div class='modalformline'>\n  <p style='color:red'>\n      " + warning + "\n  </p>\n  <pre>\n  /home/" + nickname + "/" + instancesDir + "/" + name + "\n  /home/" + nickname + "/Web/" + instancesDir + "/" + name + "</pre>\n</div>",
        height: "auto",
        overlay: true,
        width: 500,
        buttons: {
          Delete: {
            style: "modal-clean-red",
            loader: {
              color: "#ffffff",
              diameter: 16
            },
            callback: function() {
              _this.removeItem(listItemView);
              return KD.getSingleton("kiteController").run(command, function(err, res) {
                modal.buttons.Delete.hideLoader();
                modal.destroy();
                if (err) {
                  console.log("Deleting Angularjs Error", err);
                  return new KDNotificationView({
                    title: "There was an error, you may need to remove it manually!",
                    duration: 3333
                  });
                } else {
                  return new KDNotificationView({
                    title: "Your AngularJS app: '" + name + "' is successfully deleted.",
                    duration: 3333
                  });
                }
              });
            }
          }
        }
      });
    });
  }

  DashboardPane.prototype.openInNewTab = function(url) {
    var link;
    link = document.createElement("a");
    link.href = link.target = url;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    return link.parentNode.removeChild(link);
  };

  DashboardPane.prototype.removeItem = function(listItemView) {
    var blogToDelete, blogs,
      _this = this;
    blogs = appStorage.getValue("blogs");
    blogToDelete = listItemView.getData();
    blogs.splice(blogs.indexOf(blogToDelete), 1);
    return appStorage.setValue("blogs", blogs, function() {
      _this.listController.removeItem(listItemView);
      return appStorage.fetchValue("blogs", function(blogs) {
        if (blogs == null) {
          blogs = [];
        }
        if (blogs.length === 0) {
          return _this.notice.show();
        }
      });
    });
  };

  DashboardPane.prototype.putNewItem = function(formData, resizeSplit) {
    var tabs;
    if (resizeSplit == null) {
      resizeSplit = true;
    }
    tabs = this.getDelegate();
    tabs.showPane(this);
    this.listController.addItem(formData);
    this.notice.hide();
    if (resizeSplit) {
      return this.utils.wait(1500, function() {
        return split.resizePanel(0, 1);
      });
    }
  };

  DashboardPane.prototype.viewAppended = function() {
    var _this = this;
    DashboardPane.__super__.viewAppended.apply(this, arguments);
    this.loader.show();
    return appStorage.fetchStorage(function(storage) {
      var blogs;
      _this.loader.hide();
      blogs = appStorage.getValue("blogs") || [];
      if (blogs.length > 0) {
        blogs.sort(function(a, b) {
          if (a.timestamp < b.timestamp) {
            return -1;
          } else {
            return 1;
          }
        });
        return blogs.forEach(function(item) {
          return _this.putNewItem(item, false);
        });
      } else {
        return _this.notice.show();
      }
    });
  };

  DashboardPane.prototype.pistachio = function() {
    return "{{> this.loader}}\n{{> this.notice}}\n{{> this.listWrapper}}";
  };

  return DashboardPane;

})(KodularJSPane);

KodularJSInstalledAppListItem = (function(_super) {
  __extends(KodularJSInstalledAppListItem, _super);

  function KodularJSInstalledAppListItem(options, data) {
    var _this = this;
    options.type = "kodularjs-blog";
    KodularJSInstalledAppListItem.__super__.constructor.call(this, options, data);
    this.terminalButton = new KDButtonView({
      cssClass: "clean-gray test-input",
      title: "Open terminal",
      callback: function() {
        return _this.getDelegate().emit("StartTerminal", _this);
      }
    });
    this.serverButton = new KDButtonView({
      cssClass: "kodularjs-button cupid-green clean-gray test-input",
      title: "Publish " + data.name,
      callback: function() {
        return _this.getDelegate().emit("StartGrunt", _this);
      }
    });
    this["delete"] = new KDCustomHTMLView({
      tagName: "a",
      cssClass: "delete-link",
      click: function() {
        return _this.getDelegate().emit("DeleteLinkClicked", _this);
      }
    });
  }

  KodularJSInstalledAppListItem.prototype.viewAppended = function() {
    var _this = this;
    this.setTemplate(this.pistachio());
    this.template.update();
    return this.utils.wait(function() {
      return _this.setClass("in");
    });
  };

  KodularJSInstalledAppListItem.prototype.pistachio = function() {
    var angularjsversion, domain, instancesDir, name, nickname, path, timestamp, url, _ref;
    _ref = this.getData(), path = _ref.path, timestamp = _ref.timestamp, domain = _ref.domain, name = _ref.name, angularjsversion = _ref.angularjsversion;
    instancesDir = "kodularjs";
    url = "https://" + domain + "/" + instancesDir + "/" + name;
    nickname = KD.whoami().profile.nickname;
    return "{{> this.delete}}\n<a target='_blank' class='name-link' href='" + url + "'> {{#(name)}} </a>\n<div class=\"instance-block\">\n    KodularJS Project Path: /home/" + nickname + "/" + instancesDir + "/{{#(name)}}\n    <br />\n    KodularJS Web Path: /home/" + nickname + "/Web/" + instancesDir + "/{{#(name)}}\n    <br />\n    AngularJS Version: {{#(angularjsversion)}}\n    <br />\n    {{> this.terminalButton}}   {{> this.serverButton}}\n</div>\n<time datetime='" + (new Date(timestamp)) + "'>" + ($.timeago(new Date(timestamp))) + "</time>";
  };

  return KodularJSInstalledAppListItem;

})(KDListItemView);
/* BLOCK STARTS: /home/gemma/Applications/kodularjs.kdapp/installpane.coffee */
var InstallPane, appStorage, kite, nickname,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

kite = KD.getSingleton("kiteController");

nickname = KD.whoami().profile.nickname;

appStorage = new AppStorage("kodularjs-installer", "1.0");

InstallPane = (function(_super) {
  __extends(InstallPane, _super);

  function InstallPane() {
    this.installAngularJS = __bind(this.installAngularJS, this);
    var angularjsversion, newVersionOptions, vmc,
      _this = this;
    InstallPane.__super__.constructor.apply(this, arguments);
    this.form = new KDFormViewWithFields({
      callback: this.bound("installAngularJS"),
      buttons: {
        install: {
          title: "Create AngularJS app",
          style: "cupid-green",
          type: "submit",
          loader: {
            color: "#444444",
            diameter: 12
          }
        }
      },
      fields: {
        name: {
          label: "Name of AngularJS App:",
          name: "name",
          placeholder: "type a name for your app...",
          defaultValue: "my_angularjs_app",
          validate: {
            rules: {
              required: "yes",
              regExp: /(^$)|(^[a-z\d]+([_][a-z\d]+)*$)/i
            },
            messages: {
              required: "a name for your angularjs app is required!"
            }
          },
          nextElement: {
            timestamp: {
              name: "timestamp",
              type: "hidden",
              defaultValue: Date.now()
            }
          }
        },
        domain: {
          label: "Domain :",
          name: "domain",
          itemClass: KDSelectBox,
          defaultValue: "" + nickname + ".kd.io"
        },
        angularjsversion: {
          label: "AngularJS Version :",
          name: "angularjsversion",
          itemClass: KDSelectBox,
          defaultValue: "1.0.3"
        }
      }
    });
    this.form.on("FormValidationFailed", function() {
      return _this.form.buttons["Create AngularJS app"].hideLoader();
    });
    vmc = KD.getSingleton('vmController');
    vmc.fetchVMs(function(err, vms) {
      if (err) {
        return console.log(err);
      } else {
        return vms.forEach(function(vm) {
          return vmc.fetchVMDomains(vm, function(err, domains) {
            var domain, newSelectOptions, usableDomains;
            newSelectOptions = [];
            usableDomains = [
              (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = domains.length; _i < _len; _i++) {
                  domain = domains[_i];
                  if (!/^(vm|shared)-[0-9]/.test(domain)) {
                    _results.push(domain);
                  }
                }
                return _results;
              })()
            ].first;
            usableDomains.forEach(function(domain) {
              return newSelectOptions.push({
                title: domain,
                value: domain
              });
            });
            domain = _this.form.inputs.domain;
            return domain.setSelectOptions(newSelectOptions);
          });
        });
      }
    });
    newVersionOptions = [];
    newVersionOptions.push({
      title: "1.0.3 (stable)",
      value: "1.0.3"
    });
    angularjsversion = this.form.inputs.angularjsversion;
    angularjsversion.setSelectOptions(newVersionOptions);
  }

  InstallPane.prototype.completeInputs = function(fromPath) {
    var name, path, pathExtension, slug, val, _ref;
    if (fromPath == null) {
      fromPath = false;
    }
    _ref = this.form.inputs, path = _ref.path, name = _ref.name, pathExtension = _ref.pathExtension;
    if (fromPath) {
      val = path.getValue();
      slug = KD.utils.slugify(val);
      if (/\//.test(val)) {
        path.setValue(val.replace('/', ''));
      }
    } else {
      slug = KD.utils.slugify(name.getValue());
      path.setValue(slug);
    }
    if (slug) {
      slug += "/";
    }
    return pathExtension.inputLabel.updateTitle("/" + slug);
  };

  InstallPane.prototype.checkPath = function(name, callback) {
    var instancesDir;
    instancesDir = "kodularjs";
    return kite.run("[ -d /home/" + nickname + "/" + instancesDir + "/" + name + " ] && echo 'These directories exist'", function(err, response) {
      if (response) {
        console.log("You have already a AngularJS app with the name \"" + name + "\". Please delete it or choose another path");
      }
      return typeof callback === "function" ? callback(err, response) : void 0;
    });
  };

  InstallPane.prototype.showInstallFail = function() {
    return new KDNotificationView({
      title: "AngularJS app exists already. Please delete it or choose another name",
      duration: 3000
    });
  };

  InstallPane.prototype.installAngularJS = function() {
    var angularjsversion, domain, name, timestamp,
      _this = this;
    domain = this.form.inputs.domain.getValue();
    name = this.form.inputs.name.getValue();
    angularjsversion = this.form.inputs.angularjsversion.getValue();
    timestamp = parseInt(this.form.inputs.timestamp.getValue(), 10);
    console.log("ANGULARJS VERSION", angularjsversion);
    return this.checkPath(name, function(err, response) {
      var instancesDir, tmpAppDir, webDir;
      if (err) {
        console.log("Starting install with formData", _this.form);
        instancesDir = "/home/" + nickname + "/kodularjs";
        webDir = "/home/" + nickname + "/Web/kodularjs/" + name;
        tmpAppDir = "" + instancesDir + "/tmp";
        return kite.run("mkdir -p '" + tmpAppDir + "'", function(err, res) {
          var formData, installCmd, kodularjsScript, modal, newFile;
          if (err) {
            return console.log(err);
          } else {
            kodularjsScript = "#!/bin/bash\necho \"Grabbing the AngularJS boilerplate project\"\ngit clone -q git://github.com/joshdmiller/ng-boilerplate \"" + instancesDir + "/" + name + "\"\ncd \"" + instancesDir + "/" + name + "\"\ngit checkout -b master\n\necho \"Checking for grunt (configuration management)\"\n[ `which grunt` ] || sudo npm -g --loglevel warn install grunt-cli\necho \"Checking for karma (unit testing)\"\n[ `which karma` ] || sudo npm -g --loglevel warn install karma\necho \"Checking for bower (package management)\"\n[ `which bower` ] || sudo npm -g --loglevel warn install bower\nsudo chown -R " + nickname + ":" + nickname + " `npm -g config get tmp`\n\necho \"Installing boilerplate dependencies\"\nnpm --loglevel warn install\nnpm cache clean\nbower --quiet cache clean\nbower --quiet install\n\n# use phantomjs by default, because this environment is headless\nmv karma/karma-unit.tpl.js karma/karma-unit.tpl.js.bak\nsed \"s/'Firefox'/'PhantomJS'/\" karma/karma-unit.tpl.js.bak > karma/karma-unit.tpl.js\nrm karma/karma-unit.tpl.js.bak\n\n# move the compile dir to the web root\nmv build.config.js build.config.js.bak\nsed \"s,compile_dir: 'bin',compile_dir: '" + webDir + "',\" build.config.js.bak > build.config.js\nrm build.config.js.bak\n\n# commit config changes\ngit commit -am \"modify config for kodularjs\"\n\necho \"Setting up the first build\"\ngrunt clean html2js jshint coffeelint coffee recess:build concat:build_css copy index:build compile\n\necho -e '\nNew AngularJS project \"" + name + "\" created:'\necho -e '  Source directory : " + instancesDir + "/" + name + "'\necho -e '  Web directory    : " + webDir + "'\necho -e '  Web address      : http://" + nickname + ".kd.io/kodularjs/" + name + "\n'";
            newFile = FSHelper.createFile({
              type: 'file',
              path: "" + tmpAppDir + "/kodularjsScript.sh",
              vmName: _this.vmName
            });
            newFile.save(kodularjsScript, function(err, res) {
              if (err) {
                return warn(err);
              } else {
                return _this.emit("fs.saveAs.finished", newFile, _this);
              }
            });
            installCmd = "bash " + tmpAppDir + "/kodularjsScript.sh && rm -rf " + tmpAppDir + "\n";
            formData = {
              timestamp: timestamp,
              domain: domain,
              name: name,
              angularjsversion: angularjsversion
            };
            modal = new ModalViewWithTerminal({
              title: "Creating AngularJS App: '" + name + "'",
              width: 700,
              overlay: false,
              terminal: {
                height: 500,
                command: installCmd,
                hidden: false
              },
              content: "<div class='modalformline'>\n  <p>Using AngularJS <strong>" + angularjsversion + "</strong></p>\n  <br>\n  <i>note: your sudo password is your koding password. </i>\n</div>"
            });
            _this.form.buttons.install.hideLoader();
            appStorage.fetchValue('blogs', function(blogs) {
              blogs || (blogs = []);
              blogs.push(formData);
              return appStorage.setValue("blogs", blogs);
            });
            return _this.emit("AngularJSInstalled", formData);
          }
        });
      } else {
        _this.form.buttons.install.hideLoader();
        return _this.showInstallFail();
      }
    });
  };

  InstallPane.prototype.pistachio = function() {
    return "{{> this.form}}";
  };

  return InstallPane;

})(KodularJSPane);
/* BLOCK STARTS: /home/gemma/Applications/kodularjs.kdapp/main.coffee */
var split;

appView.addSubView(split = new KodularJSSplit({
  cssClass: "kodularjs",
  type: "horizontal",
  resizable: false,
  sizes: ["100%", null]
}));

/* KDAPP ENDS */
}).call();