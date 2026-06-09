/*global QUnit*/

sap.ui.define([
	"input/in/table/row/tasks/ui5/ui5inputintablerowtask2/controller/EmployeeTable.controller"
], function (Controller) {
	"use strict";

	QUnit.module("EmployeeTable Controller");

	QUnit.test("I should test the EmployeeTable controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
