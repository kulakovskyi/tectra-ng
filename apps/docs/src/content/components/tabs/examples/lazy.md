Content in an `ng-template txTabPanelContent` is created on the first visit and then kept. With `lazy`, only the active panel is rendered — the others are destroyed when you leave them.
