//Inquirer validation functions
module.exports = {
    checkLength: function(input) {
        if(input.length > 20 || input.length === 0) {
            return ('This field must be between 1 and 20 characters');
        }
        return true;
    },
    checkValue: function(input) {
        if(!input) {
            return('This field cannot be left blank!');
        };
        return true;
    },
    checkNumber: function(input) {
        if(isNaN(input) || input < 1) {
            return('This value must be a valid number with a minimum value of 1!');
        };
        return true;
    }
};

