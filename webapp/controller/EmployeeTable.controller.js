sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Fragment, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("input.in.table.row.tasks.ui5.ui5inputintablerowtask2.controller.EmployeeTable", {
        onInit() {
            this.oModel = this.getOwnerComponent().getModel("jobApplicants");
            this.oView = this.getView();
            this.addRowCounter = 0;
            this.lastEntryIndex = -1;
            this.serialNumber = this.oModel.getProperty("/Table").length;
            this.candidateSelected = false;
            this.workLocationSelected = false;
            this.valueHelpControl = null;
            this.selectedJobCode = null;
            this.selectedCandidateId = null;
        },

        onAddRow() {
            const candidateData = this.oModel.getProperty("/Table");
            if (this.addRowCounter === 0) this.lastEntryIndex = candidateData.length - 1;
            this.addRowCounter++;
            this.oView.byId("submitBtn").setVisible(true);
            this.oView.byId("cancelBtn").setVisible(true);
            this.oModel.setProperty("/newEntry", {
                jobCode: "",
                candidateId: "",
                workLocation: "",
                skills: [],
                editableRow: true,
                editableCandidateId: false,
                editableWorkLocation: false,
                editableSkills: false,
                serialNumber: this.serialNumber + this.addRowCounter
            });
            candidateData.push(this.oModel.getProperty("/newEntry"));
            this.oModel.setProperty("/Table", candidateData);
            console.log(this.oModel.getProperty("/Table"));
            
        },

        onSubmit() {
            const candidateTableData = this.oModel.getProperty("/Table");
            console.log(candidateTableData);
            for (let i= this.lastEntryIndex + 1; i < candidateTableData.length; i++) {
                const entry = candidateTableData[i];
                console.log(entry);
                if (!entry.jobCode || !entry.candidateId || !entry.workLocation || !entry.skills.length) {
                    alert("Please fill all the fields before submitting the data.");
                    return;
                }
            }
            for (let i = this.lastEntryIndex + 1; i < this.oModel.getProperty("/Table").length; i++) {
                this.oModel.setProperty(`/Table/${i}/editableRow`, false);
                this.oModel.setProperty(`/Table/${i}/serialNumber`, i + 1);
            }
            this.oView.byId("submitBtn").setVisible(false);
            this.oView.byId("cancelBtn").setVisible(false);
            this.addRowCounter = 0;
            this.lastEntryIndex = -1;
        },
        
        onCancel() {
            const candidateTableData = this.oModel.getProperty("/Table");
            let i = new Number(this.addRowCounter);
            while (i > 0) {
                candidateTableData.pop();
                i--;
            }
            this.oModel.setProperty("/Table", candidateTableData);
            this.oView.byId("submitBtn").setVisible(false);
            this.oView.byId("cancelBtn").setVisible(false);
            console.log(this.oModel);
            this.addRowCounter = 0;
            this.lastEntryIndex = -1;
        },

        onSelectDialogRequested(oEvent) {
            this.serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
            if (!this._oSelectDialog) {
                this._oSelectDialog = Fragment.load({
                    name: "input.in.table.row.tasks.ui5.ui5inputintablerowtask2.view.fragments.F4Help",
                    controller: this
                }).then(oFragment => {
                    this.oView.addDependent(oFragment);
                    return oFragment;
                });
            }
            
            this._oSelectDialog.then(oDialog => {
                let control;
                const controlId = oEvent.getSource().getId();
                if (controlId.includes("candidateIdCell")) {
                    this.valueHelpControl = "candidateIdCell";
                    control = this.oView.byId("candidateIdCell");
                    let jobCodes = this.oModel.getProperty("/uniqueJobCodes");
                    for (let i = 0; i < jobCodes.length; i++) {
                        if (jobCodes[i].title === this.selectedJobCode) {
                            this.oModel.setProperty("/activeDialogItems", jobCodes[i].candidates);
                            console.log(this.oModel.getProperty("/activeDialogItems"));
                            break;
                        }
                    }
                }
                return oDialog;
            });

            this._oSelectDialog.then(oDialog => {
                let control;
                const controlId = oEvent.getSource().getId();
                if (controlId.includes("workLocationCell")) {
                    this.valueHelpControl = "workLocationCell";
                    this.candidateSelected = true;
                    control = this.oView.byId("workLocationCell");
                    let candidateIds = this.oModel.getProperty("/uniqueCandidateCodesAndNames");
                    for (let i = 0; i < candidateIds.length; i++) {
                        if (candidateIds[i].title === this.selectedCandidateId) {
                            this.oModel.setProperty("/activeDialogItems", candidateIds[i].workLocations);
                            console.log(this.oModel.getProperty("/activeDialogItems"));
                            break;
                        }
                    }
                }
                return oDialog;
            });
            
            this._oSelectDialog.then(oDialog => {
                // oDialog.setBindingContext(control.getBindingContext(), "jobApplicants");
                oDialog.open();
            });

            // // filter based on job code input or candidate id input
            // this._oSelectDialog.then(oDialog => {
            //     const controlId = oEvent.getSource().getId();
            //     console.log(controlId);
            //     const oBinding = oDialog.getBinding("items");
            //     console.log(oBinding);
            //     // if the control is candidate id input, filter based on job code input and if the control is work location filter based on both job code and candidate id input
            //     if (controlId.includes("candidateIdCell")) {
            //         const jobCodeInput = this.oView.byId("jobCodeCell").getValue();
            //         const filters = [];
            //         // oBinding.filter(new Filter("jobCode", FilterOperator.EQ, jobCodeInput));
            //     } else if (controlId.includes("workLocationCell")) {
            //         const jobCodeInput = this.oView.byId("jobCodeCell").getValue();
            //         const candidateIdInput = this.oView.byId("candidateIdCell").getValue();
            //         const filters = [];
            //         // if (jobCodeInput) {
            //             filters.push(new Filter("jobCode", FilterOperator.EQ, jobCodeInput));
            //         // }
            //         // if (candidateIdInput) {
            //             filters.push(new Filter("candidateId", FilterOperator.EQ, candidateIdInput));
            //         // }
            //         // oBinding.filter(filters);
            //     }
            // });
        },

        onSelectDialogConfirm(oEvent) {
            const selectedItemTitle = oEvent.getParameter("selectedItem").getTitle();
            if (this.valueHelpControl === "candidateIdCell") {
                this.oModel.setProperty(`/Table/${this.serialNumber - 1}/editableWorkLocation`, true);
                this.oModel.setProperty(`/Table/${this.serialNumber - 1}/candidateId`, selectedItemTitle);
                console.log(this.oModel.getProperty('/Table'));
            }  
            else if (this.valueHelpControl === "workLocationCell") {
                this.oModel.setProperty(`/Table/${this.serialNumber - 1}/editableSkills`, true);
                this.oModel.setProperty(`/Table/${this.serialNumber - 1}/workLocation`, selectedItemTitle);
                console.log(this.oModel.getProperty('/Table'));
            }
        },

        onJobCodeChange(oEvent) {
            const serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
            const selectedJobCode = oEvent.getSource().getSelectedKey();
            this.selectedJobCode = selectedJobCode;
            if (selectedJobCode) {
                this.oModel.setProperty(`/Table/${serialNumber - 1}/editableCandidateId`, true);
            }
        },

        onCandidateIdChange(oEvent) {
            const serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
            const selectedCandidateId = oEvent.getSource().getSelectedKey();
            this.selectedCandidateId = selectedCandidateId;
            if (selectedCandidateId) {
                this.oModel.setProperty(`/Table/${serialNumber - 1}/editableWorkLocation`, true);
            }
        },

        onWorkLocationChange(oEvent) {
            const serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
            const control = oEvent.getSource();
            if (control.getValue()) {
                this.oModel.setProperty(`/Table/${serialNumber - 1}/editableSkills`, true);
            }
        },
    });
});