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
                    this.valueHelpControl = "candidateIdCell";
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
                    this.valueHelpControl = "workLocationCell";
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
            if (this.valueHelpControl === "candidateIdCell") {
                this.oModel.setProperty(rowPath + "/editableCandidateId", true);
                this.oModel.setProperty(rowPath + "/candidateId", selectedItemTitle);
                // console.log(this.oModel.getProperty('/Table'));
                this.oModel.setProperty(rowPath + "/workLocation", "");
                this.oModel.setProperty(rowPath + "/skills", []);
                this.oModel.setProperty(rowPath + "/editableSkills", false);
            }  
            else if (this.valueHelpControl === "workLocationCell") {
                this.oModel.setProperty(rowPath + "/editableSkills", true);
                this.oModel.setProperty(rowPath + "/workLocation", selectedItemTitle);
                // console.log(this.oModel.getProperty('/Table'));
            }
        },

        onJobCodeChange(oEvent) {
            const comboBox = oEvent.getSource();
            const bindingContext = comboBox.getBindingContext("jobApplicants");
            const rowPath = bindingContext.getPath();
            const selectedJobCode = comboBox.getSelectedKey();
            this.selectedJobCode = selectedJobCode;
            if (selectedJobCode) {
                this.oModel.setProperty(rowPath + "/editableCandidateId", true);
            } else {
                this.oModel.setProperty(rowPath + "/editableCandidateId", false);
            }
            this.oModel.setProperty(rowPath + "/candidateId", "");
            this.oModel.setProperty(rowPath + "/workLocation", "");
            this.oModel.setProperty(rowPath + "/skills", []);
            this.oModel.setProperty(rowPath + "/editableWorkLocation", false);
            this.oModel.setProperty(rowPath + "/editableSkills", false);
        },

        onSelectDialogCancel(oEvent) {
            oEvent.getSource().close();
        }

        // onSelectionChange(oEvent) {
        //     if (this.valueHelpControl === "candidateIdCell") {
        //         const serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
        //         const selectedCandidateId = oEvent.getParameter("selectedItem").getTitle();
        //         this.selectedCandidateId = selectedCandidateId;
        //         this.oView.byId("workLocationCell").setValue("");
        //         if (selectedCandidateId) {
        //             this.oModel.setProperty(`/Table/${serialNumber - 1}/editableWorkLocation`, true);
        //         }
        //     } else if (this.valueHelpControl === "workLocationCell") {
        //         const serialNumber = oEvent.getSource().getBindingContext("jobApplicants").getProperty("serialNumber");
        //         const selectedWorkLocation = oEvent.getParameter("selectedItem").getTitle();
        //         this.oView.byId("skillsCell").setValue("");
        //         if (selectedWorkLocation) {
        //             this.oModel.setProperty(`/Table/${serialNumber - 1}/editableSkills`, true);
        //         }
        //     }
            // console.log("Candidate changed");
            // console.log(oEvent.getSource());
            // const bindingContext = oEvent.getSource().getBindingContext("jobApplicants");
            // console.log(bindingContext);
            // const selectedCandidateId = oEvent.getSource().getSelectedKey();
            // console.log(selectedCandidateId);
            // this.selectedCandidateId = selectedCandidateId;
            // console.log(this.selectedCandidateId);
            // if (selectedCandidateId) {
            //     this.oModel.setProperty(`/Table/${serialNumber - 1}/editableWorkLocation`, true);
            // }
        // }
    });
});