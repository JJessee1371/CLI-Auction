//Inquirer validation functions
module.exports = {
    checkLength: function(input) {
        if(input.length > 20 || input.length < 3) {
            return ('This field must be between 3 and 20 characters long.');
        }
        return true;
    },
    checkValue: function(input) {
        if(!input) {
            return('This field cannot be left blank!');
        }
        return true;
    },
    checkNumber: function(input) {
        if(isNaN(input) || input < 1) {
            return('This value must be a valid number with a minimum value of 1.');
        }
        return true;
    },
    checkPassword: function(input) {
        if(input.length > 20 || input.length < 8) {
            return ('Password must be between 8 and 20 characters long.');
        }
        return true;
    }
};

