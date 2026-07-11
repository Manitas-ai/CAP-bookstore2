namespace my.bookstore;

entity Authors {
  key ID          : UUID;
      name        : String(100) @mandatory;
      biography   : LargeString;
      country     : String(100);
      books       : Association to many Books on books.author = $self;
}

entity Books {
  key ID                : UUID;
      title             : String(200) @mandatory;
      author            : Association to Authors;
      description       : LargeString;
      publicationYear   : Integer;
      price             : Decimal(10, 2);
      category          : String(50);
}
