window.addEventListener("load", main);

function main() {
  var i, l, info, form, linker, compiler = DOMCompiler(), views = [];
  // The data model
  info = {
    firstName: "John",
    lastName:  "Doe",
    remember:  true
  };
  // Get the form element and do something on submit
  form = document.getElementById("FormExample");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    alert("FirsName: " + info.firstName + 
          "\nLastName:" + info.lastName + 
          "\nRemember: " + info.remember);
    return false;
  })
  // Register Text Input
  compiler.register({
    view: FormTextInput,
    match: function(element) {
      return (element.nodeType === 1 && /* Element Node */
              element.tagName.toLowerCase() === "input" &&
              element.type.toLowerCase() === "text");
    }
  });
  // Register Checkbox
  compiler.register({
    view: FormCheckBox,
    match: function(element) {
      return (element.nodeType === 1 && /* Element Node */
              element.tagName.toLowerCase() === "input" &&
              element.type.toLowerCase() === "checkbox");
    }
  });
  // Compile the form
  linker = compiler.compile( form);
  // Instantiate the directives, each
  // view will be passed the linker first param to the constructor
  linker({
    viewsContainer: views,
    model: info
  });
  // Render our views
  console.log(views);
  for (i = 0, l = views.length; i < l; ++i) {
    views[i].render();
  }
}

function FormTextInput(options) { this.initialize(options); };
FormTextInput.prototype = {
  initialize: function(options) {
    this.el    = options.el;
    this.model = options.model;
    this.el.addEventListener("change", this.onChange.bind(this));
    options.viewsContainer.push(this);
  },
  render: function() {
    this.el.value = this.model[this.el.name];
    return this;
  },
  onChange: function() {
    this.model[this.el.name] = this.el.value;
  }
};

function FormCheckBox(options) { this.initialize(options); };
FormCheckBox.prototype = {
  initialize: function(options) {
    this.el    = options.el;
    this.model = options.model;
    this.el.addEventListener("change", this.onChange.bind(this));
    options.viewsContainer.push(this);
  },
  render: function() {
    this.el.checked = this.model[this.el.name] == true;
    return this;
  },
  onChange: function() {
    this.model[this.el.name] = this.el.checked;
  }
};