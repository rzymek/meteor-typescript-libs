/// <reference path="../definitions/backbone.d.ts" />
/// <reference path="../definitions/jquery.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function test_events() {
    var object = new Backbone.Events();
    object.on("alert", function (eventName) { return alert("Triggered " + eventName); });
    object.trigger("alert", "an event");
    var onChange = function () { return alert('whatever'); };
    var context;
    object.off("change", onChange);
    object.off("change");
    object.off(null, onChange);
    object.off(null, null, context);
    object.off();
}
var SettingDefaults = (function (_super) {
    __extends(SettingDefaults, _super);
    function SettingDefaults(attributes, options) {
        this.defaults = {
            name: "Joe"
        };
        // super has to come last
        _super.call(this, attributes, options);
    }
    // 'defaults' could be set in one of the following ways:
    SettingDefaults.prototype.defaults = function () {
        return {
            name: "Joe"
        };
    };
    // or set it like this
    SettingDefaults.prototype.initialize = function () {
        this.defaults = {
            name: "Joe"
        };
    };
    return SettingDefaults;
})(Backbone.Model);
var Sidebar = (function (_super) {
    __extends(Sidebar, _super);
    function Sidebar() {
        _super.apply(this, arguments);
    }
    Sidebar.prototype.promptColor = function () {
        var cssColor = prompt("Please enter a CSS color:");
        this.set({ color: cssColor });
    };
    return Sidebar;
})(Backbone.Model);
var Note = (function (_super) {
    __extends(Note, _super);
    function Note() {
        _super.apply(this, arguments);
    }
    Note.prototype.initialize = function () { };
    Note.prototype.author = function () { };
    Note.prototype.coordinates = function () { };
    Note.prototype.allowedToEdit = function (account) {
        return true;
    };
    return Note;
})(Backbone.Model);
var PrivateNote = (function (_super) {
    __extends(PrivateNote, _super);
    function PrivateNote() {
        _super.apply(this, arguments);
    }
    PrivateNote.prototype.allowedToEdit = function (account) {
        return account.owns(this);
    };
    PrivateNote.prototype.set = function (attributes, options) {
        return Backbone.Model.prototype.set.call(this, attributes, options);
    };
    return PrivateNote;
})(Note);
function test_models() {
    var sidebar = new Sidebar();
    sidebar.on('change:color', function (model, color) { return $('#sidebar').css({ background: color }); });
    sidebar.set({ color: 'white' });
    sidebar.promptColor();
    //////////
    var note = new PrivateNote();
    note.get("title");
    note.set({ title: "March 20", content: "In his eyes she eclipses..." });
    note.set("title", "A Scandal in Bohemia");
}
var Employee = (function (_super) {
    __extends(Employee, _super);
    function Employee(attributes, options) {
        _super.call(this, options);
        this.reports = new EmployeeCollection();
        this.reports.url = '../api/employees/' + this.id + '/reports';
    }
    Employee.prototype.more = function () {
        this.reports.reset();
    };
    return Employee;
})(Backbone.Model);
var EmployeeCollection = (function (_super) {
    __extends(EmployeeCollection, _super);
    function EmployeeCollection() {
        _super.apply(this, arguments);
    }
    EmployeeCollection.prototype.findByName = function (key) { };
    return EmployeeCollection;
})(Backbone.Collection);
var Book = (function (_super) {
    __extends(Book, _super);
    function Book() {
        _super.apply(this, arguments);
    }
    return Book;
})(Backbone.Model);
var Library = (function (_super) {
    __extends(Library, _super);
    function Library() {
        _super.apply(this, arguments);
    }
    return Library;
})(Backbone.Collection);
var Books = (function (_super) {
    __extends(Books, _super);
    function Books() {
        _super.apply(this, arguments);
    }
    return Books;
})(Backbone.Collection);
function test_collection() {
    var books = new Books();
    var book1 = new Book({ title: "Title 1", author: "Mike" });
    books.add(book1);
    // Objects can be added to collection by casting to model type.
    // Compiler will check if object properties are valid for the cast.
    // This gives better type checking than declaring an `any` overload.
    books.add({ title: "Title 2", author: "Mikey" });
    var model = book1.collection.first();
    if (model !== book1) {
        throw new Error("Error");
    }
    books.each(function (book) {
        return book.get("title");
    });
    var titles = books.map(function (book) {
        return book.get("title");
    });
    var publishedBooks = books.filter(function (book) {
        return book.get("published") === true;
    });
    var alphabetical = books.sortBy(function (book) { return null; });
}
//////////
Backbone.history.start();
var v1Changes;
(function (v1Changes) {
    var events;
    (function (events) {
        function test_once() {
            var model = new Employee;
            model.once('invalid', function () { }, this);
            model.once('invalid', function () { });
        }
        function test_listenTo() {
            var model = new Employee;
            var view = new Backbone.View();
            view.listenTo(model, 'invalid', function () { });
        }
        function test_listenToOnce() {
            var model = new Employee;
            var view = new Backbone.View();
            view.listenToOnce(model, 'invalid', function () { });
        }
        function test_stopListening() {
            var model = new Employee;
            var view = new Backbone.View();
            view.stopListening(model, 'invalid', function () { });
            view.stopListening(model, 'invalid');
            view.stopListening(model);
        }
    })(events || (events = {}));
    var ModelAndCollection;
    (function (ModelAndCollection) {
        function test_url() {
            Employee.prototype.url = function () { return '/employees'; };
            EmployeeCollection.prototype.url = function () { return '/employees'; };
        }
        function test_parse() {
            var model = new Employee();
            model.parse('{}', {});
            var collection = new EmployeeCollection;
            collection.parse('{}', {});
        }
        function test_toJSON() {
            var model = new Employee();
            model.toJSON({});
            var collection = new EmployeeCollection;
            collection.toJSON({});
        }
        function test_sync() {
            var model = new Employee();
            model.sync();
            var collection = new EmployeeCollection;
            collection.sync();
        }
    })(ModelAndCollection || (ModelAndCollection = {}));
    var Model;
    (function (Model) {
        function test_validationError() {
            var model = new Employee;
            if (model.validationError) {
                console.log('has validation errors');
            }
        }
        function test_fetch() {
            var model = new Employee({ id: 1 });
            model.fetch({
                success: function () { },
                error: function () { }
            });
        }
        function test_set() {
            var model = new Employee;
            model.set({ name: 'JoeDoe', age: 21 }, { validate: false });
            model.set('name', 'JoeDoes', { validate: false });
        }
        function test_destroy() {
            var model = new Employee;
            model.destroy({
                wait: true,
                success: function (m, response, options) { },
                error: function (m, jqxhr, options) { }
            });
            model.destroy({
                success: function (m, response, options) { },
                error: function (m, jqxhr) { }
            });
            model.destroy({
                success: function () { },
                error: function (m, jqxhr) { }
            });
        }
        function test_save() {
            var model = new Employee;
            model.save({
                name: 'Joe Doe',
                age: 21
            }, {
                wait: true,
                validate: false,
                success: function (m, response, options) { },
                error: function (m, jqxhr, options) { }
            });
            model.save({
                name: 'Joe Doe',
                age: 21
            }, {
                success: function () { },
                error: function (m, jqxhr) { }
            });
        }
        function test_validate() {
            var model = new Employee;
            model.validate({ name: 'JoeDoe', age: 21 }, { validateAge: false });
        }
    })(Model || (Model = {}));
    var Collection;
    (function (Collection) {
        function test_fetch() {
            var collection = new EmployeeCollection;
            collection.fetch({ reset: true });
        }
        function test_create() {
            var collection = new EmployeeCollection;
            var model = new Employee;
            collection.create(model, {
                validate: false
            });
        }
    })(Collection || (Collection = {}));
    var Router;
    (function (Router) {
        function test_navigate() {
            var router = new Backbone.Router;
            router.navigate('/employees', { trigger: true });
            router.navigate('/employees', true);
        }
    })(Router || (Router = {}));
})(v1Changes || (v1Changes = {}));
