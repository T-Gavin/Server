"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ByteArray {
    /**
     * 构造函数
     * @param buffer {string|ArrayBuffer} 初始数据
     */
    constructor(buffer) {
        /**
         * 缓冲区扩张大小
         * @type {number}
         */
        this.BUFFER_EXT_SIZE = 0;
        this.EOF_byte = -1;
        this.EOF_code_point = -1;
        this.setArrayBuffer(buffer || new ArrayBuffer(this.BUFFER_EXT_SIZE));
        this.endian = ByteArray.Endian.BIG_ENDIAN;
    }
    /**
     * 设置当前缓冲区数据
     * @param buffer {ArrayBuffer} 初始数据
     * @private
     */
    setArrayBuffer(buffer) {
        this.write_position = buffer.byteLength;
        this.data = new DataView(buffer);
        this._position = 0;
    }
    /** 当前缓冲区 */
    get buffer() {
        return this.data.buffer;
    }
    /** 当前缓冲区 */
    set buffer(value) {
        this.data = new DataView(value);
    }
    /** 获取当前偏移位 */
    get bufferOffset() {
        return this.data.byteOffset;
    }
    /** 当前字节位 */
    get position() {
        return this._position;
    }
    /** 当前字节位 */
    set position(value) {
        this._position = value;
        this.write_position = value > this.write_position ? value : this.write_position;
    }
    /**
     * ByteArray 对象的长度（以字节为单位）。
     * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
     * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
     */
    get length() {
        return this.write_position;
    }
    set length(value) {
        this.write_position = value;
        let tmp = new Uint8Array(new ArrayBuffer(value));
        let byteLength = this.data.buffer.byteLength;
        if (byteLength > value)
            this._position = value;
        let length = Math.min(byteLength, value);
        tmp.set(new Uint8Array(this.data.buffer, 0, length));
        this.buffer = tmp.buffer;
    }
    /** 可取字节数 */
    get bytesAvailable() {
        return this.data.byteLength - this._position;
    }
    /** 清除字节数组内容 */
    clear() {
        this.setArrayBuffer(new ArrayBuffer(this.BUFFER_EXT_SIZE));
    }
    /**
     * 从字节流中读取布尔值
     * @returns {boolean}
     */
    readBoolean() {
        if (!this.validate(ByteArray.SIZE_OF_BOOLEAN))
            return null;
        return this.data.getUint8(this.position++) != 0;
    }
    /**
     * 从字节流中读取带符号的字节,介于-128到127之间的整数
     * @returns {boolean}
     */
    readByte() {
        if (!this.validate(ByteArray.SIZE_OF_INT8))
            return null;
        return this.data.getInt8(this.position++);
    }
    /**
     * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
     * @param bytes {ByteArray} 读入数据对象ByteArray
     * @param offset {number} bytes 中的偏移（位置），应从该位置写入读取的数据
     * @param length {number} 要读取的字节数。默认值为0,读取所有可用的数据
     * @returns {null}
     */
    readBytes(bytes, offset = 0, length = 0) {
        if (length == 0)
            length = this.bytesAvailable;
        else if (!this.validate(length))
            return null;
        if (bytes)
            bytes.validateBuffer(offset + length);
        else
            bytes = new ByteArray(new ArrayBuffer(offset + length));
        for (let i = 0; i < length; i++)
            bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
    }
    /**
     * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
     * @returns {number}
     */
    readDouble() {
        if (!this.validate(ByteArray.SIZE_OF_FLOAT64))
            return null;
        let value = this.data.getFloat64(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
        return value;
    }
    /**
     * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
     * @returns {number}
     */
    readFloat() {
        if (!this.validate(ByteArray.SIZE_OF_FLOAT32))
            return null;
        let value = this.data.getFloat32(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
        return value;
    }
    /**
     * 从字节流中读取一个带符号的 32 位整数
     * @returns {number}
     */
    readInt() {
        if (!this.validate(ByteArray.SIZE_OF_INT32))
            return null;
        let value = this.data.getInt32(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
        return value;
    }
    /**
     * 从字节流中读取一个带符号的 16 位整数
     * @returns {number}
     */
    readShort() {
        if (!this.validate(ByteArray.SIZE_OF_INT16))
            return null;
        let value = this.data.getInt16(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
        return value;
    }
    /**
     * 从字节流中读取无符号的字节
     * @returns {number}
     */
    readUnsignedByte() {
        if (!this.validate(ByteArray.SIZE_OF_UINT8))
            return null;
        return this.data.getUint8(this.position++);
    }
    /**
     * 从字节流中读取一个无符号的 32 位整数
     * @returns {number}
     */
    readUnsignedInt() {
        if (!this.validate(ByteArray.SIZE_OF_UINT32))
            return null;
        let value = this.data.getUint32(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
        return value;
    }
    /**
     * 从字节流中读取一个无符号的 16 位整数
     * @returns {number}
     */
    readUnsignedShort() {
        if (!this.validate(ByteArray.SIZE_OF_UINT16))
            return null;
        let value = this.data.getUint16(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        return value;
    }
    /**
     * 从字节流中读取一个 UTF-8 字符串
     * @returns {string}
     */
    readUTF() {
        if (!this.validate(ByteArray.SIZE_OF_UINT16))
            return null;
        let length = this.data.getUint16(this.position, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        return (length > 0) ? this.readUTFBytes(length) : "";
    }
    /**
     * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
     * @param length 指明 UTF-8 字节长度的无符号短整型数
     * @returns {number}
     */
    readUTFBytes(length) {
        if (!this.validate(length))
            return null;
        let bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
        this.position += length;
        return this.decodeUTF8(bytes);
    }
    /**
     * 写入布尔值
     * @param value {boolean} 值 (true-> 1 | false-> 0)
     */
    writeBoolean(value) {
        this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN);
        this.data.setUint8(this.position++, value ? 1 : 0);
    }
    /**
     * 在字节流中写入一个字节
     * @param value {number} 值 一个32位整数,使用参数的低8位,忽略高24位
     */
    writeByte(value) {
        this.validateBuffer(ByteArray.SIZE_OF_INT8);
        this.data.setInt8(this.position++, value);
    }
    /**
     * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
     * @param bytes {ByteArray} 写入的ByteArray对象
     * @param offset {number} 开始写入的位置
     * @param length {number} 一个无符号整数的写入范围
     */
    writeBytes(bytes, offset = 0, length = 0) {
        let writeLength;
        if (offset < 0)
            return;
        if (length < 0)
            return;
        else if (length == 0)
            writeLength = bytes.length - offset;
        else
            writeLength = Math.min(bytes.length - offset, length);
        if (writeLength > 0) {
            this.validateBuffer(writeLength);
            let tmp_data = new DataView(bytes.buffer);
            let length = writeLength;
            let BYTES_OF_UINT32 = 4;
            for (; length > BYTES_OF_UINT32; length -= BYTES_OF_UINT32) {
                this.data.setUint32(this._position, tmp_data.getUint32(offset));
                this.position += BYTES_OF_UINT32;
                offset += BYTES_OF_UINT32;
            }
            for (; length > 0; length--)
                this.data.setUint8(this.position++, tmp_data.getUint8(offset++));
        }
    }
    /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
     * @param value {number} 双精度（64 位）浮点数
     */
    writeDouble(value) {
        this.validateBuffer(ByteArray.SIZE_OF_FLOAT64);
        this.data.setFloat64(this.position, value, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
    }
    /**
     * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
     * @param value {number} 单精度（32 位）浮点数
     */
    writeFloat(value) {
        this.validateBuffer(ByteArray.SIZE_OF_FLOAT32);
        this.data.setFloat32(this.position, value, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
    }
    /**
     * 在字节流中写入一个带符号的 32 位整数
     * @param value {number} 要写入的整数
     */
    writeInt(value) {
        this.validateBuffer(ByteArray.SIZE_OF_INT32);
        this.data.setInt32(this.position, value, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
    }
    /**
     * 在字节流中写入一个 16 位整数
     * @param value {number} 32位整数,使用低16位,忽略高16位
     */
    writeShort(value) {
        this.validateBuffer(ByteArray.SIZE_OF_INT16);
        this.data.setInt16(this.position, value, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
    }
    /**
     * 在字节流中写入一个无符号的 32 位整数
     * @param value {number} 要写入的无符号整数
     */
    writeUnsignedInt(value) {
        this.validateBuffer(ByteArray.SIZE_OF_UINT32);
        this.data.setUint32(this.position, value, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
    }
    /**
     * 在字节流中写入一个无符号的 16 位整数
     * @param value {number} 要写入的无符号整数
     */
    writeUnsignedShort(value) {
        this.validateBuffer(ByteArray.SIZE_OF_UINT16);
        this.data.setUint16(this.position, value, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
    }
    /**
     * 写入 UTF-8 字节流
     * @param value {string} 要写入的字符串值
     */
    writeUTF(value) {
        let utf8bytes = this.encodeUTF8(value);
        let length = utf8bytes.length;
        this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length);
        this.data.setUint16(this.position, length, this.endian == ByteArray.Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        this._writeUint8Array(utf8bytes, false);
    }
    /**
     * 写入 UTF-8 字节流,不使用 16 位长度的词为字符串添加前缀
     * @param value {string} 要写入的字符串值
     */
    writeUTFBytes(value) {
        this._writeUint8Array(this.encodeUTF8(value));
    }
    /**
     * 缓冲区toString
     * @returns {string}
     */
    toString() {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    }
    /**
     * 将 Uint8Array 写入字节流
     * @param bytes
     * @param validateBuffer
     * @private
     */
    _writeUint8Array(bytes, validateBuffer = true) {
        if (validateBuffer)
            this.validateBuffer(this.position + bytes.length);
        for (let i = 0; i < bytes.length; i++)
            this.data.setUint8(this.position++, bytes[i]);
    }
    /**
     * 验证追尾
     * @param len
     * @returns {boolean}
     */
    validate(len) {
        if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength)
            return true;
        else
            return false; //throw new Error("Error:" + 1025 + "遇到文件尾.");
    }
    /**
     * 缓冲区验证
     * @param len
     * @param needReplace
     */
    validateBuffer(len, needReplace = false) {
        this.write_position = len > this.write_position ? len : this.write_position;
        len += this._position;
        if (this.data.byteLength < len || needReplace) {
            let tmp = new Uint8Array(new ArrayBuffer(len + this.BUFFER_EXT_SIZE));
            let length = Math.min(this.data.buffer.byteLength, len + this.BUFFER_EXT_SIZE);
            tmp.set(new Uint8Array(this.data.buffer, 0, length));
            this.buffer = tmp.buffer;
        }
    }
    /**
     * 编码 UTF-8
     * @param str
     * @returns {Uint8Array}
     */
    encodeUTF8(str) {
        let pos = 0;
        let codePoints = this.stringToCodePoints(str);
        let outputBytes = [];
        while (codePoints.length > pos) {
            let code_point = codePoints[pos++];
            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            }
            else {
                let count, offset;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                }
                else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                }
                else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
                }
                outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                while (count > 0) {
                    let temp = this.div(code_point, Math.pow(64, count - 1));
                    outputBytes.push(0x80 + (temp % 64));
                    count -= 1;
                }
            }
        }
        return new Uint8Array(outputBytes);
    }
    /**
     * 解码 UTF-8
     * @param data
     * @returns {string}
     */
    decodeUTF8(data) {
        let fatal = false;
        let pos = 0;
        let result = "";
        let code_point;
        let utf8_code_point = 0;
        let utf8_bytes_needed = 0;
        let utf8_bytes_seen = 0;
        let utf8_lower_boundary = 0;
        while (data.length > pos) {
            let _byte = data[pos++];
            if (_byte == this.EOF_byte) {
                if (utf8_bytes_needed != 0) {
                    code_point = this.decoderError(fatal);
                }
                else {
                    code_point = this.EOF_code_point;
                }
            }
            else {
                if (utf8_bytes_needed == 0) {
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    }
                    else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        }
                        else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        }
                        else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        }
                        else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                }
                else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                }
                else {
                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                    if (utf8_bytes_seen !== utf8_bytes_needed) {
                        code_point = null;
                    }
                    else {
                        let cp = utf8_code_point;
                        let lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        }
                        else {
                            code_point = this.decoderError(fatal, _byte);
                        }
                    }
                }
            }
            // 解码字符串
            if (code_point !== null && code_point !== this.EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0)
                        result += String.fromCharCode(code_point);
                }
                else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }
        return result;
    }
    /**
     * 编码错误
     * @param code_point
     */
    encoderError(code_point) {
        throw new Error("Error:" + 1026 + "EncodingError! The code point {" + code_point + "} could not be encoded.");
    }
    /**
     * 解码错误
     * @param fatal
     * @param opt_code_point
     * @returns {*|number}
     */
    decoderError(fatal, opt_code_point) {
        if (fatal) {
            throw new Error("Error:" + 1027 + "DecodingError.");
        }
        return opt_code_point || 0xFFFD;
    }
    /**
     * 约束范围
     * @param a
     * @param min
     * @param max
     * @returns {boolean}
     */
    inRange(a, min, max) {
        return min <= a && a <= max;
    }
    /**
     * 分割
     * @param n
     * @param d
     * @returns {number}
     */
    div(n, d) {
        return Math.floor(n / d);
    }
    /**
     * DOMString Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
     * @param string
     * @returns {Array}
     */
    stringToCodePoints(string) {
        // 防止传空
        !string && (string = "");
        let cps = [];
        let i = 0, n = string.length;
        while (i < string.length) {
            let c = string.charCodeAt(i);
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            }
            else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            }
            else {
                if (i == n - 1) {
                    cps.push(0xFFFD);
                }
                else {
                    let d = string.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        let a = c & 0x3FF;
                        let b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    }
                    else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    }
}
/**
 * 标头序列
 * @type {{}}
 */
ByteArray.Endian = {
    /** 小标头序列 */
    LITTLE_ENDIAN: "littleEndian",
    /** 大标头序列 */
    BIG_ENDIAN: "bigEndian"
};
/**
 * bool缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_BOOLEAN = 1;
/**
 * int8缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_INT8 = 1;
/**
 * int16缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_INT16 = 2;
/**
 * int32缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_INT32 = 4;
/**
 * uint8缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_UINT8 = 1;
/**
 * uint16缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_UINT16 = 2;
/**
 * uint32缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_UINT32 = 4;
/**
 * float32缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_FLOAT32 = 4;
/**
 * float64缓存区大小
 * @type {number}
 */
ByteArray.SIZE_OF_FLOAT64 = 8;
exports.default = ByteArray;
