sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "input.in.table.row.tasks.ui5.ui5inputintablerowtask2.view.",
		autoWait: true
	});
});
