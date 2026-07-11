sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
  "use strict";

  return Controller.extend("my.bookstore.adminauthors.controller.Main", {

    // ----------------------------------------------------------------
    //  Lifecycle
    // ----------------------------------------------------------------
    onInit: function () {
      this._oDialog   = null;
      this._oContext  = null;
      this._bEditMode = false;
    },

    // ----------------------------------------------------------------
    //  Navigation
    // ----------------------------------------------------------------
    onHome: function () {
      window.location.href = "/index.html";
    },

    // ----------------------------------------------------------------
    //  Fragment dialog – lazy creation
    // ----------------------------------------------------------------
    _getDialog: function () {
      if (!this._oDialog) {
        this._oDialog = sap.ui.xmlfragment(
          this.getView().getId(),
          "my.bookstore.adminauthors.fragment.AuthorDialog",
          this
        );
        this.getView().addDependent(this._oDialog);
      }
      return this._oDialog;
    },

    // ----------------------------------------------------------------
    //  Add Author
    // ----------------------------------------------------------------
    onAddAuthor: function () {
      this._bEditMode = false;
      this._oContext  = null;
      this._openDialog("Add Author", "", "", "");
    },

    // ----------------------------------------------------------------
    //  Edit Author
    // ----------------------------------------------------------------
    onEditAuthor: function (oEvent) {
      this._bEditMode = true;
      var oItem       = oEvent.getSource().getParent().getParent();
      this._oContext  = oItem.getBindingContext();
      var oData       = this._oContext.getObject();
      this._openDialog("Edit Author", oData.name, oData.country || "", oData.biography || "");
    },

    // ----------------------------------------------------------------
    //  Delete Author
    // ----------------------------------------------------------------
    onDeleteAuthor: function (oEvent) {
      var oItem    = oEvent.getSource().getParent().getParent();
      var oContext = oItem.getBindingContext();
      var sName    = oContext.getProperty("name");

      MessageBox.confirm("Delete author \"" + sName + "\"?", {
        title: "Confirm Delete",
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.OK) {
            oContext.delete().then(function () {
              MessageToast.show("Author deleted.");
            }).catch(function (oError) {
              MessageBox.error("Delete failed:\n" + oError.message);
            });
          }
        }
      });
    },

    // ----------------------------------------------------------------
    //  Save (create or update)
    // ----------------------------------------------------------------
    onSaveAuthor: function () {
      var sName    = this.byId("inputName").getValue().trim();
      var sCountry = this.byId("inputCountry").getValue().trim();
      var sBio     = this.byId("inputBio").getValue().trim();

      if (!sName) {
        MessageBox.warning("Name is required.");
        return;
      }

      if (this._bEditMode) {
        this._oContext.setProperty("name",      sName);
        this._oContext.setProperty("country",   sCountry);
        this._oContext.setProperty("biography", sBio);
        this._oContext.getModel().submitBatch("$auto").then(function () {
          MessageToast.show("Author updated.");
        }).catch(function (oError) {
          MessageBox.error("Update failed:\n" + oError.message);
        });
      } else {
        var oBinding = this.byId("authorsTable").getBinding("items");
        oBinding.create({ name: sName, country: sCountry, biography: sBio });
        MessageToast.show("Author created.");
      }

      this._getDialog().close();
    },

    // ----------------------------------------------------------------
    //  Cancel
    // ----------------------------------------------------------------
    onCancelDialog: function () {
      if (!this._bEditMode) {
        var oBinding = this.byId("authorsTable").getBinding("items");
        if (oBinding) { oBinding.resetChanges(); }
      }
      this._getDialog().close();
    },

    // ----------------------------------------------------------------
    //  Internal helpers
    // ----------------------------------------------------------------
    _openDialog: function (sTitle, sName, sCountry, sBio) {
      var oDialog = this._getDialog();
      oDialog.setTitle(sTitle);
      this.byId("inputName").setValue(sName);
      this.byId("inputCountry").setValue(sCountry);
      this.byId("inputBio").setValue(sBio);
      oDialog.open();
    }

  });
});
