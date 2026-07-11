sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/Item"
], function (Controller, JSONModel, MessageBox, MessageToast, Item) {
  "use strict";

  return Controller.extend("my.bookstore.adminbooks.controller.Main", {

    // ----------------------------------------------------------------
    //  Lifecycle
    // ----------------------------------------------------------------
    onInit: function () {
      this._bEditMode = false;
      this._oContext  = null;
      this._loadAuthors();
    },

    // ----------------------------------------------------------------
    //  Load authors into the Select inside the dialog
    // ----------------------------------------------------------------
    _loadAuthors: function () {
      var oModel   = this.getOwnerComponent().getModel();
      var oBinding = oModel.bindList("/Authors", null, null, null, {
        $orderby: "name"
      });
      oBinding.requestContexts().then(function (aContexts) {
        var oSelect = this.byId("selectAuthor");
        // Remove old items except the placeholder (index 0)
        while (oSelect.getItems().length > 1) {
          oSelect.removeItem(1);
        }
        aContexts.forEach(function (oCtx) {
          oSelect.addItem(new Item({
            key:  oCtx.getProperty("ID"),
            text: oCtx.getProperty("name")
          }));
        });
      }.bind(this)).catch(function (oError) {
        MessageBox.error("Could not load authors:\n" + oError.message);
      });
    },

    // ----------------------------------------------------------------
    //  Navigation
    // ----------------------------------------------------------------
    onHome: function () {
      window.location.href = "/index.html";
    },

    // ----------------------------------------------------------------
    //  Add Book
    // ----------------------------------------------------------------
    onAddBook: function () {
      this._bEditMode = false;
      this._oContext  = null;
      this._loadAuthors();
      this._openDialog("Add Book", "", "", "", "", "", "");
    },

    // ----------------------------------------------------------------
    //  Edit Book
    // ----------------------------------------------------------------
    onEditBook: function (oEvent) {
      this._bEditMode = true;
      var oItem       = oEvent.getSource().getParent().getParent();
      this._oContext  = oItem.getBindingContext();
      var oData       = this._oContext.getObject();
      this._loadAuthors();
      this._openDialog(
        "Edit Book",
        oData.title             || "",
        oData.author_ID         || "",
        oData.category          || "",
        oData.publicationYear   ? String(oData.publicationYear) : "",
        oData.price             ? String(oData.price)           : "",
        oData.description       || ""
      );
    },

    // ----------------------------------------------------------------
    //  Delete Book
    // ----------------------------------------------------------------
    onDeleteBook: function (oEvent) {
      var oItem    = oEvent.getSource().getParent().getParent();
      var oContext = oItem.getBindingContext();
      var sTitle   = oContext.getProperty("title");

      MessageBox.confirm("Delete book \"" + sTitle + "\"?", {
        title: "Confirm Delete",
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.OK) {
            oContext.delete().then(function () {
              MessageToast.show("Book deleted.");
            }).catch(function (oError) {
              MessageBox.error("Delete failed:\n" + oError.message);
            });
          }
        }
      });
    },

    // ----------------------------------------------------------------
    //  Save Book
    // ----------------------------------------------------------------
    onSaveBook: function () {
      var sTitle       = this.byId("inputTitle").getValue().trim();
      var sAuthorID    = this.byId("selectAuthor").getSelectedKey();
      var sCategory    = this.byId("selectCategory").getSelectedKey();
      var sYear        = this.byId("inputYear").getValue().trim();
      var sPrice       = this.byId("inputPrice").getValue().trim();
      var sDescription = this.byId("inputDescription").getValue().trim();

      if (!sTitle) {
        MessageBox.warning("Title is required.");
        return;
      }
      if (!sAuthorID) {
        MessageBox.warning("Please select an author.");
        return;
      }

      var oPayload = {
        title:           sTitle,
        author_ID:       sAuthorID,
        category:        sCategory  || null,
        publicationYear: sYear      ? parseInt(sYear,  10) : null,
        price:           sPrice     ? parseFloat(sPrice)   : null,
        description:     sDescription || null
      };

      if (this._bEditMode) {
        // ---- UPDATE ----
        Object.keys(oPayload).forEach(function (sKey) {
          this._oContext.setProperty(sKey, oPayload[sKey]);
        }.bind(this));
        this._oContext.getModel().submitBatch("$auto").then(function () {
          MessageToast.show("Book updated.");
        }).catch(function (oError) {
          MessageBox.error("Update failed:\n" + oError.message);
        });
      } else {
        // ---- CREATE ----
        var oBinding = this.byId("booksTable").getBinding("items");
        oBinding.create(oPayload);
        MessageToast.show("Book created.");
      }

      this.byId("bookDialog").close();
    },

    // ----------------------------------------------------------------
    //  Cancel
    // ----------------------------------------------------------------
    onCancelDialog: function () {
      if (!this._bEditMode) {
        var oBinding = this.byId("booksTable").getBinding("items");
        if (oBinding) { oBinding.resetChanges(); }
      }
      this.byId("bookDialog").close();
    },

    // ----------------------------------------------------------------
    //  Internal helper
    // ----------------------------------------------------------------
    _openDialog: function (sTitle, sBookTitle, sAuthorID, sCategory, sYear, sPrice, sDesc) {
      var oDialog = this.byId("bookDialog");
      oDialog.setTitle(sTitle);
      this.byId("inputTitle").setValue(sBookTitle);
      this.byId("selectAuthor").setSelectedKey(sAuthorID);
      this.byId("selectCategory").setSelectedKey(sCategory);
      this.byId("inputYear").setValue(sYear);
      this.byId("inputPrice").setValue(sPrice);
      this.byId("inputDescription").setValue(sDesc);
      oDialog.open();
    }

  });
});
