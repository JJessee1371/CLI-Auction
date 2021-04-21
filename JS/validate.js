//Inquirer validation functions
module.exports = {
    checkLength: function(input) {
        if(input.length > 20) {
            return ('This field cannot be longer than 20 characters!');
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
        if(isNaN(input)) {
            return('This value must be a valid number!');
        };
        return true;
    }
};

