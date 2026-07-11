using my.bookstore as db from '../db/schema';

// Public read-only service – Books overview screen
service BrowseService {
  @readonly entity Books as projection on db.Books;
  @readonly entity Authors as projection on db.Authors;
}

// Admin service – Books and Authors maintenance screens
service AdminService {
  entity Authors as projection on db.Authors;
  entity Books   as projection on db.Books;
}
