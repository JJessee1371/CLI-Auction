const { checkLength, checkNumber, checkValue, checkPassword } = require('../JS/validate');

describe('validate', () => {
    describe('checkLength', () => {
        it('Should return true for strings less than 20 characters', () => {
            const user = 'shortstring';

            expect(checkLength(user)).toBe(true);
        });

        it('Should return \'This field must be between 1 and 20 characters\' if longer than 20 characters', () => {
            const user = 'iamareallylongstringandshouldnotpass';

            expect(checkLength(user)).toBe('This field must be between 1 and 20 characters');
        });

        it('Should return \'This field must be between 1 and 20 characters\' if nothing is entered', () => {
            const user = '';

            expect(checkLength(user)).toBe('This field must be between 1 and 20 characters');
        });
    });

    describe('checkPassword', () => {
        it('Should return an error message if the string is less than 8 characters long', () => {
            const password = 'abc';

            expect(checkPassword(password)).toBe('Password must be between 8 and 20 characters long');
        });

        it('Should return an error message if the string is more than 20 characters long', () => {
            const password = 'iamareallylongstringandshouldnotpass';

            expect(checkPassword(password)).toBe('Password must be between 8 and 20 characters long');
        });

        it('Should return true if the entere value is between 8 and 20 characters long', () => {
            const password = '123abc456qwe';

            expect(checkPassword(password)).toBe(true);
        });
    });

    describe('checkValue', () => {
        it('Should return true if there is a string entered in the input field', () => {
            const input = 'some string';

            expect(checkValue(input)).toBe(true);
        });

        it('Should return true if a number value is entered in the input field', () => {
            const input = 4;

            expect(checkValue(input)).toBe(true);
        });

        it('Should return \This field cannot be left blank!\ if no value is entered', () => {
            const input = '';

            expect(checkValue(input)).toBe('This field cannot be left blank!');
        });
    });

    describe('checkNumber', () => {
        it('Should return true if the value entered is a valid positive number', () => {
            const num = 5;

            expect(checkNumber(num)).toBe(true);
        });

        it('Should return \'This value must be a valid number with a minimum value of 1!\' if the value entered is 0', () => {
            const num = 0;

            expect(checkNumber(num)).toBe('This value must be a valid number with a minimum value of 1!');
        });

        it('Should return \'This value must be a valid number with a minimum value of 1!\' if the value entered is negative', () => {
            const num = -3;

            expect(checkNumber(num)).toBe('This value must be a valid number with a minimum value of 1!');
        });

        it('Should return \'This value must be a valid number with a minimum value of 1!\' if the value entered is not a number', () => {
            const num = 'string';

            expect(checkNumber(num)).toBe('This value must be a valid number with a minimum value of 1!');
        });
    });
});