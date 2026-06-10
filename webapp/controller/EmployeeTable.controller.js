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
            this.valueHelpControlId = null;
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
                console.log(i, entry);
                if (!entry.jobCode || !entry.candidateId || !entry.workLocation || !entry.skills.length) {
                    alert("Please fill all the fields before submitting the data.");
                    return;
                }
            }
            for (let i = this.lastEntryIndex + 1; i < this.oModel.getProperty("/Table").length; i++) {
                this.oModel.setProperty(`/Table/${i}/editableCandidateId`, false);
                this.oModel.setProperty(`/Table/${i}/editableWorkLocation`, false);
                this.oModel.setProperty(`/Table/${i}/editableSkills`, false);
                this.oModel.setProperty(`/Table/${i}/editableRow`, false); // for job code editable
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
            const inputControl = oEvent.getSource();
            this.serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
            this.valueHelpControl = inputControl;
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
                // let control;
                const controlId = inputControl.getId();
                if (controlId.includes("candidateIdCell")) {
                    this.valueHelpControlId = "candidateIdCell";
                    oDialog.setTitle('Select Candidate ID');
                    let jobCodes = this.oModel.getProperty("/uniqueJobCodes");
                    // control = this.oView.byId("candidateIdCell");
                    for (let i = 0; i < jobCodes.length; i++) {
                        if (jobCodes[i].title === this.selectedJobCode) {
                            this.oModel.setProperty("/activeDialogItems", jobCodes[i].candidates);
                            console.log(this.oModel.getProperty("/activeDialogItems"));
                            break;
                        }
                    }
                } else if (controlId.includes("workLocationCell")) {
                    this.valueHelpControlId = "workLocationCell";
                    oDialog.setTitle('Select Work Location');
                    let candidateIds = this.oModel.getProperty("/uniqueCandidateCodesAndNames");
                    for (let i = 0; i < candidateIds.length; i++) {
                        if (candidateIds[i].title === this.selectedCandidateId) {
                            this.oModel.setProperty("/activeDialogItems", candidateIds[i].workLocations);
                            console.log(this.oModel.getProperty("/activeDialogItems"));
                            break;
                        }
                    }
                }
                oDialog.open();
            });
        },

        onSelectDialogConfirm(oEvent) {
            const selectedItemTitle = oEvent.getParameter("selectedItem").getTitle();
            const bindingContext = this.valueHelpControl.getBindingContext("jobApplicants");
            console.log(bindingContext);
            const rowPath = bindingContext.getPath();
            if (this.valueHelpControlId === "candidateIdCell") {
                this.oModel.setProperty(rowPath + "/editableWorkLocation", true);
                this.oModel.setProperty(rowPath + "/candidateId", selectedItemTitle);
                this.oModel.setProperty(rowPath + "/workLocation", "");
                this.oModel.setProperty(rowPath + "/skills", []);
                this.oModel.setProperty(rowPath + "/editableSkills", false);
                this.selectedCandidateId = selectedItemTitle;
            }  
            else if (this.valueHelpControlId === "workLocationCell") {
                this.oModel.setProperty(rowPath + "/editableSkills", true);
                this.oModel.setProperty(rowPath + "/workLocation", selectedItemTitle);
            }
        },

        onSelectDialogCancel(oEvent) {
            oEvent.getSource().close();
        },

        onJobCodeChange(oEvent) {
            const comboBox = oEvent.getSource();
            const bindingContext = comboBox.getBindingContext("jobApplicants");
            const rowPath = bindingContext.getPath();
            const selectedJobCode = comboBox.getSelectedKey();
            this.selectedJobCode = selectedJobCode;
            if (selectedJobCode) {
                this.oModel.setProperty(rowPath + "/editableCandidateId", true);
                this.oModel.setProperty(rowPath + "/jobCode", selectedJobCode);
            } else {
                this.oModel.setProperty(rowPath + "/editableCandidateId", false);
            }
            this.oModel.setProperty(rowPath + "/candidateId", "");
            this.oModel.setProperty(rowPath + "/workLocation", "");
            this.oModel.setProperty(rowPath + "/skills", []);
            this.oModel.setProperty(rowPath + "/editableWorkLocation", false);
            this.oModel.setProperty(rowPath + "/editableSkills", false);
        },

        onSkillsChange(oEvent) {
            const multiComboBox = oEvent.getSource();
            const selectedItems = multiComboBox.getSelectedItems();
            const selectedSkills = selectedItems.map(item => item.getText());
            const bindingContext = multiComboBox.getBindingContext("jobApplicants");
            const rowPath = bindingContext.getPath();
            this.oModel.setProperty(rowPath + "/skills", selectedSkills);
        },

        onDeleteRow(oEvent) {
            const bindingContext = oEvent.getSource().getBindingContext("jobApplicants");
            const rowPath = bindingContext.getPath();
            const rowIndex = parseInt(rowPath.split("/").pop());
            const candidateTableData = this.oModel.getProperty("/Table");
            candidateTableData.splice(rowIndex, 1);
            this.oModel.setProperty("/Table", candidateTableData);
        }
    });
});