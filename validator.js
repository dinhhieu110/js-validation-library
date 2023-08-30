var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

// Object
function Validator(options) {
  // Nơi lưu rules, để 1 input có thể chạy đc nhiều hơn 1 rule
  var selectorRules = {};
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    // Span element nodes
    var errElement = getParent(inputElement, options.formGroup).querySelector(
      options.errorSelector
    );
    var errorMessage;
    var parent = getParent(inputElement, options.formGroup);

    var rules = selectorRules[rule.selector];

    // Lặp từng rule và kiểm tra
    // Nếu có lỗi thì break, để các rule không override
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errElement.innerHTML = errorMessage;
      // make error msg red
      parent.classList.add("invalid");
      // End make err msg red
    } else {
      errElement.innerHTML = " ";
      parent.classList.remove("invalid");
    }
    return !errorMessage; // if it has err message --> return false (string converted to boolean)
  }

  // Lấy Elements của form cần validate
  var formElement = $(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);

        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      // Xử lí gửi entered data when NO Error!
      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          // Lấy ra toàn bộ input fields có property là name
          var enableInputs = formElement.querySelectorAll("[name]");
          // biến enables nodelist ra Array để dùng các phương thức lặp
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case "checkbox":
                if (!input.matches(":checked")) return values;
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }

            return values;
          },
          {});

          options.onSubmit(formValues);
        }
      }
    };

    // Lặp qua mỗi rule và xử lí lắng nghe các sự kiện (blur, input,...)
    options.rules.forEach(function (rule) {
      // Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          // Xử lí người dùng blur ra khỏi input field
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
          // END Xử lí người dùng blur ra khỏi input field

          // Xử lí khi người dùng nhập input
          inputElement.oninput = function () {
            var errElement = getParent(
              inputElement,
              options.formGroup
            ).querySelector(options.errorSelector);
            errElement.innerHTML = " ";
            getParent(inputElement, options.formGroup).classList.remove(
              "invalid"
            );
          };
        }
      });
    });
  }
}

// Rules

// Rule isRequired:
//1.  Return error message when empty input
//2.  Return undefined/nothing when input is valid
Validator.isRequired = function (selector, errmsg) {
  return {
    selector: selector,
    test: function (inputValue) {
      return inputValue ? undefined : errmsg || "Please Enter this field";
    },
  };
};
Validator.isEmail = function (selector, errmsg) {
  return {
    selector: selector,
    test: function (inputValue) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(inputValue)
        ? undefined
        : errmsg || "Please Enter this field";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (inputValue) {
      return inputValue.length >= min
        ? undefined
        : `Please Enter ${min} characters at least!`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (inputValue) {
      return inputValue === getConfirmValue()
        ? undefined
        : message || "Please Enter this field";
    },
  };
};

// phut 26
