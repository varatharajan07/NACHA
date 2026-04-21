"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const overrides_js_1 = require("../overrides.js");
const utils_js_1 = require("../utils.js");
const validate_js_1 = __importDefault(require("../validate.js"));
const fields_js_1 = require("./fields.js");
/**
 * @class Entry
 * @description Entry class that will be used to create Entry objects
 * @param {EntryOptions} options - required
 * @param {boolean} autoValidate - optional / defaults to true
 * @param {boolean} debug - optional / defaults to false
 */
class Entry {
    /**
     * @param {EntryOptions} options - required
     * @param {boolean} autoValidate - optional / defaults to true
     * @param {boolean} debug - optional / defaults to false
     * @returns {Entry}
     */
    constructor(options, autoValidate = true, debug = false) {
        this.addendas = [];
        this.debug = debug;
        const defaultsClone = JSON.parse(JSON.stringify(fields_js_1.EntryFieldDefaults));
        if (options.fields) {
            // Merge into a fresh object so each Entry has independent field objects
            this.fields = (0, utils_js_1.deepMerge)({}, defaultsClone, options.fields);
        }
        else {
            this.fields = (0, utils_js_1.deepMerge)({}, defaultsClone);
        }
        overrides_js_1.highLevelFieldOverrides.forEach((field) => {
            if (field in options) {
                const value = options[field];
                if (value) {
                    if (field === 'transactionCode'
                        || field === 'receivingDFI'
                        || field === 'traceNumber'
                        || field === 'checkDigit'
                        || field === 'DFIAccount'
                        || field === 'idNumber'
                        || field === 'discretionaryData') {
                        this.set(field, value);
                    }
                    else if (field === 'amount') {
                        this.set(field, Number(value));
                    }
                    else {
                        this.set(field, value);
                    }
                }
            }
        });
        // Some values need special coercing, so after they've been set by overrideLowLevel() we override them
        if (options.receivingDFI) {
            this.fields.receivingDFI.value = (0, utils_js_1.computeCheckDigit)(options.receivingDFI).slice(0, -1);
            this.fields.checkDigit.value = (0, utils_js_1.computeCheckDigit)(options.receivingDFI).slice(-1);
        }
        if (options.DFIAccount) {
            this.fields.DFIAccount.value = options.DFIAccount.slice(0, this.fields.DFIAccount.width);
        }
        if (options.amount) {
            this.fields.amount.value = Number(options.amount);
        }
        if (options.idNumber) {
            this.fields.idNumber.value = options.idNumber;
        }
        if (options.individualName) {
            this.fields.individualName.value = options.individualName.slice(0, this.fields.individualName.width);
        }
        if (options.discretionaryData) {
            this.fields.discretionaryData.value = options.discretionaryData;
        }
        if (autoValidate !== false) {
            // Validate required fields have been passed
            this._validate();
        }
    }
    addAddenda(entryAddenda) {
        const traceNumber = this.get('traceNumber');
        // Add indicator to Entry record
        this.fields.addendaId.value = '1';
        // Set corresponding fields on Addenda
        entryAddenda.set('addendaSequenceNumber', this.addendas.length + 1);
        entryAddenda.set('entryDetailSequenceNumber', traceNumber);
        // Add the new entryAddenda to the addendas array
        this.addendas.push(entryAddenda);
    }
    getAddendas() { return this.addendas; }
    getRecordCount() { return this.addendas.length + 1; }
    _validate() {
        try {
            const { validateDataTypes, validateLengths, validateRequiredFields, validateRoutingNumber, validateACHCode } = (0, validate_js_1.default)(this);
            // Validate required fields
            validateRequiredFields(this.fields);
            // Validate the ACH code passed
            if (this.fields.addendaId.value == '0') {
                validateACHCode(this.fields.transactionCode.value);
            }
            else {
                if (this.fields.transactionCode.value) {
                    //  validateACHAddendaCode(this.fields.transactionCode.value);
                    //! - this didn't do anything in the base library
                }
            }
            // Validate the routing number
            validateRoutingNumber((0, utils_js_1.addNumericalString)(this.fields.receivingDFI.value, this.fields.checkDigit.value));
            // Validate header field lengths
            validateLengths(this.fields);
            // Validate header data types
            validateDataTypes(this.fields);
        }
        catch (error) {
            if (this.debug)
                console.debug('[Entry::_validate::Error]', error);
            throw error;
        }
    }
    async generateString() {
        const result = [await (0, utils_js_1.generateString)(this.fields)];
        for await (const addenda of this.addendas) {
            result.push(await addenda.generateString());
        }
        return result.join('\r\n');
    }
    get(field) {
        return this.fields[field]['value'];
    }
    set(field, value) {
        if (this.fields[field])
            this.fields[field]['value'] = value;
    }
}
exports.default = Entry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW50cnkvRW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxrREFBMEQ7QUFDMUQsMENBQStGO0FBQy9GLGlFQUF5QztBQUV6QywyQ0FBaUQ7QUFFakQ7Ozs7OztHQU1HO0FBQ0gsTUFBcUIsS0FBSztJQU14Qjs7Ozs7T0FLRztJQUNILFlBQVksT0FBcUIsRUFBRSxlQUF3QixJQUFJLEVBQUUsUUFBaUIsS0FBSztRQVJoRixhQUFRLEdBQXdCLEVBQUUsQ0FBQztRQVN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUM7WUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLG9CQUFTLEVBQUMsOEJBQWtCLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBZ0IsQ0FBQztTQUM1RTthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxFQUFFLDhCQUFrQixDQUFnQixDQUFDO1NBQ2hFO1FBRUQsc0NBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDeEMsSUFBSSxLQUFLLElBQUksT0FBTyxFQUFDO2dCQUNuQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRTdCLElBQUksS0FBSyxFQUFFO29CQUNULElBQUksS0FBSyxLQUFLLGlCQUFpQjsyQkFDNUIsS0FBSyxLQUFLLGNBQWM7MkJBQ3hCLEtBQUssS0FBSyxhQUFhOzJCQUN2QixLQUFLLEtBQUssWUFBWTsyQkFDdEIsS0FBSyxLQUFLLFlBQVk7MkJBQ3RCLEtBQUssS0FBSyxVQUFVOzJCQUNwQixLQUFLLEtBQUssbUJBQW1CLEVBQUU7d0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQW9CLENBQUMsQ0FBQztxQkFDdkM7eUJBQU0s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