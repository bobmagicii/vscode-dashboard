# Dashboard for VS Code

Adds the ability to create and organize projects into a dashboard for easy
launching. Supports both local directories and Remote Development connections.

* Download: [link to vscode marketplace after release]
* Report Issues: https://github.com/bobmagicii/vscode-dashboard

![Alt text](/local/gfx/ex-dashboard.png "A Busy Dashboard")



# Auto-Theming

Through the power of the 460 some CSS variables Microsoft has set, Dashboard
tries its best to look good regardless of the theme. Cannot promise it will
nail it every time but it tries.

![Alt text](/local/gfx/ex-autotheme.png "Dark and Light")



# Responsive Sizing

With VS Code being Electron this uses standard web crap to be responsive. The
column breaking can be customized in the settings.

![Alt text](/local/gfx/ex-responsive.png "Responsive AF")



# Usage

After installing you should get an Icon in the top left which upon clicking
will open the project dashboard. If the window opens without a workspace, it
should open the dashboard automatically.

![Alt text](/local/gfx/ex-first-open.png "First Open")

You can add new projects directly to the dashboard, or you can create new
folders to group the projects. Projects can be dragged and dropped between
different folders and reordered.

The colours and icons of the projects can be changed in their individual
settings. Folders can also manage the colours of projects within to make them
all match or look pretty.



# Dashboard Settings

![Alt text](/local/gfx/ex-dashboard-settings.png "Dashboard Settings")

![Alt text](/local/gfx/ex-project-settings.png "Project Settings")

![Alt text](/local/gfx/ex-folder-menu.png "Folder Menu")



# Syncing (or not if you prefer)

All project settings are stored in your user config file. If you have enabled
settings sync then your dashboard will automatically sync across all your
installations logged in with the same account.

If you do not want them to sync, open the VS Code settings, click the
little gear next to the setting, and uncheck "Sync This Setting".

![Alt text](/local/gfx/ex-setting-sync.png "Don't sync that setting.")
