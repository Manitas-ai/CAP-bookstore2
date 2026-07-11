sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("my.bookstore.bookshop.controller.Main", {

    onAfterRendering: function () {
      this._updateCount();
      var oBinding = this.byId("booksTable").getBinding("items");
      oBinding.attachChange(this._updateCount.bind(this));
    },

    _updateCount: function () {
      var oBinding = this.byId("booksTable").getBinding("items");
      var iCount   = oBinding ? oBinding.getLength() : 0;
      this.byId("bookCount").setText(iCount + " book(s)");
    },

    onSearch: function (oEvent) {
      var sQuery   = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
      var oBinding = this.byId("booksTable").getBinding("items");

      if (sQuery.trim()) {
        var oFilter = new Filter({
          filters: [
            new Filter("title",    FilterOperator.Contains, sQuery),
            new Filter("category", FilterOperator.Contains, sQuery),
            new Filter("author/name", FilterOperator.Contains, sQuery)
          ],
          and: false
        });
        oBinding.filter([oFilter]);
      } else {
        oBinding.filter([]);
      }
    },

    onHome: function () {
      window.location.href = "/index.html";
    }

  });
});
