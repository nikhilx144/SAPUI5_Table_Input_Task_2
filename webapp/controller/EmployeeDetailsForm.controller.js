sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("input.in.table.row.tasks.ui5.ui5inputintablerowtask2.controller.EmployeeDetailsForm", {
        onInit() {
        },

        onNavBack() {
            const router = UIComponent.getRouterFor(this);
            router.navTo("RouteEmployeeTable");
        },

        onSubmit() {

        }
    });
});