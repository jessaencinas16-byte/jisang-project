/* ===== Vendored qrcode-generator library (kazuhikoarase/qrcode-generator, MIT) — bundled inline, outputs pure SVG, no canvas/image/CDN dependency ===== */
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript UTF8 Support (optional)
//
// Copyright (c) 2011 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

!function(qrcode) {

  //---------------------------------------------------------------------
  // overwrite qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

}(qrcode);

/* ===== End vendored qrcode-generator — BrewPOS app code below ===== */

function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}


async function apiRequest(method, url, body) {
  const opts = { method, headers: {}, credentials: 'same-origin' }; 
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let data = null;
  try { data = await res.json(); } catch (e) {  }

  if (res.status === 401 && App.user) {
    
    App.user = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    App.route = 'login';
    App.render();
    toast('Session Expired', 'Please sign in again.', 'warning');
  } else if (res.status === 403) {
    toast('Access Denied', (data && data.error) || 'Your role does not have permission for that.', 'error');
  }

  if (!res.ok) throw new Error((data && data.error) || `Server responded with ${res.status}`);
  App.connectionStatus = 'online';
  return data;
}


const LOGIN_FEATURES = [
  { icon: 'zap', title: 'Counter-fast checkout', desc: 'Ring up drinks and food in seconds, even mid-rush.' },
  { icon: 'clipboard-list', title: 'Live kitchen tickets', desc: 'Orders route straight to the kitchen display — no shouting.' },
  { icon: 'bar-chart-3', title: 'Real-time inventory', desc: "Know what's running low before you run out." },
];

const App = {
  user: null,
  route: 'login',
  cart: [],
  cartCustomer: 'Walk-in',
  activeCat: 'All',
  search: '',
  promoCode: '',
  promos: [...PROMOS],
  notifications: [...NOTIFICATIONS],
  orders: [...ORDERS],
  products: [...PRODUCTS],
  inventory: [...INVENTORY],
  customers: [...CUSTOMERS],
  users: [...USERS],
  activityLog: [],
  kitchenTimer: null,
  connectionStatus: 'checking',
  qrUrl: QR_DESTINATION_URL,

  async init() {
    this.applyTheme();
    this.loadProducts(); 
    this.loadCart();
    this.loadQRUrl();
    await this.loadAllFromServer();
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        const fresh = this.users.find(u => u.id === savedUser.id);
        this.user = fresh || null;
        this.route = this.user ? 'dashboard' : 'login';
      } catch(e) { this.user = null; }
    }
    this.render();
    this.checkLowStockNotifications();
  },

  



  checkLowStockNotifications() {
    const low = this.inventory.filter(i => i.stock < i.min);
    if (!low.length) return;
    const todayKey = new Date().toISOString().slice(0,10);
    if (this.notifications.some(n => n.type==='lowstock' && n.day===todayKey)) return;
    const names = low.slice(0,3).map(i=>i.name).join(', ');
    const extra = low.length>3 ? ` +${low.length-3} more` : '';
    this.notifications.unshift({
      id:'n'+Date.now(), type:'lowstock', title:'Low Stock Alert',
      msg:`${low.length} ingredient${low.length>1?'s':''} running low: ${names}${extra}`,
      time:'just now', read:false, day:todayKey,
    });
    toast('Low Stock Alert', `${low.length} ingredient(s) below minimum stock`, 'warning');
  },

  


  async loadAllFromServer() {
    const [products, orders, customers, inventory, promos, users] = await Promise.allSettled([
      apiRequest('GET', 'api/products.php'),
      apiRequest('GET', 'api/orders.php'),
      apiRequest('GET', 'api/customers.php'),
      apiRequest('GET', 'api/inventory.php'),
      apiRequest('GET', 'api/promotions.php'),
      apiRequest('GET', 'api/users.php'),
    ]);
    if (products.status === 'fulfilled' && Array.isArray(products.value)) { this.products = products.value; this.saveProducts(); }
    if (orders.status === 'fulfilled' && Array.isArray(orders.value)) { this.orders = orders.value; }
    if (customers.status === 'fulfilled' && Array.isArray(customers.value)) { this.customers = customers.value; }
    if (inventory.status === 'fulfilled' && Array.isArray(inventory.value)) { this.inventory = inventory.value; }
    if (promos.status === 'fulfilled' && Array.isArray(promos.value)) { this.promos = promos.value; }
    if (users.status === 'fulfilled' && Array.isArray(users.value)) { this.users = users.value; }

    const failed = [products, orders, customers, inventory, promos, users].filter(r => r.status === 'rejected');
    this.connectionStatus = failed.length ? 'offline' : 'online';
    if (failed.length) {
      
      console.info(`Using local fallback data for ${failed.length} dataset(s) — database not reachable.`);
    }
  },

  async retryConnection() {
    this.connectionStatus = 'checking';
    this.render();
    await this.loadAllFromServer();
    this.render();
    toast(this.connectionStatus === 'online' ? 'Connection restored' : 'Still offline', this.connectionStatus === 'online' ? 'Database data is up to date.' : 'Using local fallback data.', this.connectionStatus === 'online' ? 'success' : 'warning');
  },

  applyTheme() {
    const t = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', t);
    this.applyAccent();
  },

  applyAccent() {
    const a = localStorage.getItem(ACCENT_KEY) || 'coffee';
    document.documentElement.setAttribute('data-accent', a);
  },

  setAccent(id) {
    document.documentElement.setAttribute('data-accent', id);
    localStorage.setItem(ACCENT_KEY, id);
    
    if (this.route === 'login' || !this.user) this.render();
    const name = (ACCENTS.find(a => a.id === id) || {}).name || id;
    toast('Style Updated', `Switched to ${name}`, 'success');
  },


  loadProducts() {
    try {
      const s = localStorage.getItem('brewpos_products_v2');
      this.products = s ? JSON.parse(s) : [...PRODUCTS];
    } catch(e) { this.products = [...PRODUCTS]; }
  },
  saveProducts() {
    try {
      localStorage.setItem('brewpos_products_v2', JSON.stringify(this.products));
    } catch(e) {
      console.warn('Unable to persist product images (storage full).', e);
      toast('Storage full', 'Image too large to save in this browser. Using it for this session only.', 'error');
    }
  },


  loadCart() {
    try {
      const saved = localStorage.getItem('brewpos_cart');
      this.cart = saved ? JSON.parse(saved) : [];
    } catch(e) {
      console.warn('Unable to load cart from storage.', e);
      this.cart = [];
    }
  },
  saveCart() {
    try {
      localStorage.setItem('brewpos_cart', JSON.stringify(this.cart));
    } catch(e) {
      console.warn('Unable to persist cart (storage full).', e);
    }
  },

  

  loadQRUrl() {
    try {
      this.qrUrl = localStorage.getItem(QR_URL_KEY) || QR_DESTINATION_URL;
    } catch(e) { this.qrUrl = QR_DESTINATION_URL; }
  },

  isValidQRUrl(url) {
    try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch(e) { return false; }
  },

  
  saveQRDestination() {
    const input = document.getElementById('qr-url-input');
    if (!input) return;
    const url = input.value.trim();
    if (!this.isValidQRUrl(url)) {
      toast('Invalid URL', 'Enter a full link starting with http:// or https://', 'error');
      return;
    }
    this.qrUrl = url;
    try { localStorage.setItem(QR_URL_KEY, url); } catch(e) {}
    this.renderQRCode();
    toast('QR Code Updated', 'The customer QR code now points to the new link.', 'success');
  },

  
  renderQRCode() {
    const box = document.getElementById('qr-code-preview');
    if (!box) return;
    if (typeof qrcode === 'undefined') {
      console.error('BrewPOS: qrcode library is undefined — this means js/app.js did not load correctly.');
      box.innerHTML = `<div class="muted text-sm" style="padding:12px;text-align:center">QR library not found. Please re-copy the latest js/app.js file.</div>`;
      return;
    }
    try {
      const qr = qrcode(0, 'H');
      qr.addData(this.qrUrl);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 4 });
    } catch (e) {
      console.error('BrewPOS QR generation error:', e);
      box.innerHTML = `<div class="muted text-sm" style="padding:12px;text-align:center">Could not generate QR code: ${e.message}</div>`;
    }
  },

  
  downloadQRCode() {
    if (typeof qrcode === 'undefined') { toast('QR library not found', 'Re-copy the latest js/app.js file', 'error'); return; }
    try {
      const qr = qrcode(0, 'H');
      qr.addData(this.qrUrl);
      qr.make();
      const cellSize = 8, margin = 4;
      const rawUrl = qr.createDataURL(cellSize, margin);
      const a = document.createElement('a');
      a.href = rawUrl;
      a.download = 'brewpos-qr-code.png';
      a.click();
      toast('QR Code Downloaded', 'brewpos-qr-code.png saved', 'success');
    } catch (e) {
      console.error('BrewPOS QR download error:', e);
      toast('Download failed', e.message, 'error');
    }
  },

  copyQRLink() {
    copyText(this.qrUrl);
  },

  openQRLink() {
    window.open(this.qrUrl, '_blank', 'noopener');
  },

  toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem(THEME_KEY, cur);
    toast(cur === 'dark' ? 'Dark Mode' : 'Light Mode', 'Appearance updated', 'info');
  },

  hasPerm(route) {
    if (!this.user) return false;
    const perms = ROLE_PERMISSIONS[this.user.role] || [];
    return perms.includes(route);
  },

  async login(email, pass) {
    email = email.trim();
    if (!email || !pass) { toast('Validation Error', 'Please enter email and password', 'error'); return false; }
    if (!validateEmail(email)) { toast('Validation Error', 'Please enter a valid email address', 'error'); return false; }
    if (pass.length < 3) { toast('Validation Error', 'Password must be at least 3 characters', 'error'); return false; }

    let user = null;
    let dbReachable = true;
    try {
      const res = await fetch('api/login.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, pass }) });
      if (res.ok) {
        user = await res.json();
      } else if (res.status === 401) {
        toast('Login Failed', 'Invalid email or password', 'error');
        return false;
      } else {
        dbReachable = false;
      }
    } catch (e) {
      dbReachable = false; 
    }

    if (!user && !dbReachable) {
      
      
      const u = this.users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.pass === pass);
      if (!u) { toast('Login Failed', 'Invalid email or password', 'error'); return false; }
      user = u;
    }
    if (!user) { toast('Login Failed', 'Invalid email or password', 'error'); return false; }

    this.user = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    toast('Welcome back!', `${user.name} signed in as ${user.role}`, 'success');
    this.route = 'dashboard';
    this.render();
    return true;
  },

  async logout() {
    try { await apiRequest('POST', 'api/logout.php'); } catch (e) {  }
    this.user = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    this.route = 'login';
    this.stopKitchenTimer();
    this.render();
  },

  navigate(route) {
    if (this.route === route) return;
    if (route !== 'login' && !this.hasPerm(route)) {
      toast('Access Denied', 'Your role does not have permission for this page', 'error');
      route = this.hasPerm('dashboard') ? 'dashboard' : (this.hasPerm('kitchen') ? 'kitchen' : 'pos');
    }
    this.route = route;
    if (route === 'login') { this.user = null; localStorage.removeItem(CURRENT_USER_KEY); }
    this.render();
    window.scrollTo({ top: 0 });
    if (route === 'activity') this.loadActivityLog();
  },

  


  async loadActivityLog() {
    try {
      const rows = await apiRequest('GET', 'api/activity_log.php?limit=200');
      if (Array.isArray(rows)) {
        this.activityLog = rows;
        if (this.route === 'activity') this.renderPage();
      }
    } catch (err) {  }
  },

  render() {
    const app = document.getElementById('app');
    if (!this.user || this.route === 'login') {
      this.stopKitchenTimer();
      app.innerHTML = this.renderLogin();
      this.bindLoginEvents();
    } else {
      app.innerHTML = this.renderShell();
      this.bindShellEvents();
      this.renderPage();
      if (this.route === 'kitchen') this.startKitchenTimer();
      else this.stopKitchenTimer();
    }
    refreshIcons();
  },

  
  renderLogin() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const activeAccent = localStorage.getItem(ACCENT_KEY) || 'coffee';
    return `
    <div class="login-wrap">
      <div class="login-top-controls">
        <div class="style-picker" title="Choose a color style">
          ${ACCENTS.map(a => `
            <button class="style-swatch ${a.id === activeAccent ? 'active' : ''}" style="background:${a.swatch}" onclick="App.setAccent('${a.id}')" title="${a.name}"></button>
          `).join('')}
        </div>
        <button class="icon-btn login-theme-toggle" onclick="App.toggleTheme()" title="Toggle theme">
          ${icon(isDark ? 'sun' : 'moon', 20)}
        </button>
      </div>
      <div class="login-visual">
        <div class="floating-ticket">
          <div class="ticket-head"><span class="tk-id">ORD-1049</span><span class="tk-ready">Ready</span></div>
          <div class="ticket-row"><span>2× Cappuccino</span><b>₱240</b></div>
          <div class="ticket-row"><span>1× Croissant</span><b>₱95</b></div>
          <div class="ticket-total"><span>Total</span><span>₱335</span></div>
        </div>
        <div class="login-visual-content">
          <div class="glass-chip">${icon('coffee', 16)} Crafted with love since 2019</div>
          <h1>Brew, Serve,<br/>Repeat.</h1>
          <p class="lede">The all-in-one POS built for specialty coffee shops — sell at the counter, route orders to the kitchen, and keep stock on track, all without missing a beat.</p>
          <div class="feature-list">
            ${LOGIN_FEATURES.map(f => `
              <div class="feature-row">
                <div class="feature-icon">${icon(f.icon, 19)}</div>
                <div class="feature-text"><strong>${f.title}</strong><span>${f.desc}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="login-panel">
        <div class="login-card">
          <div class="login-logo">
            <div class="logo-mark">${icon('coffee', 24)}</div>
            <div>
              <h2>BrewPOS</h2>
              <p>Premium Coffee Shop POS</p>
            </div>
          </div>
          <h3 style="font-size:1.25rem;margin-bottom:4px">Welcome back 👋</h3>
          <p class="muted" style="margin-bottom:22px;font-size:.88rem">Sign in to continue to your dashboard.</p>

          <form id="login-form">
            <div class="field">
              <label>Email Address</label>
              <div class="input-group">
                ${icon('mail')}
                <input class="input" type="email" id="login-email" placeholder="you@brewpos.com" value="${isDark?'':''}" required />
              </div>
            </div>
            <div class="field">
              <label>Password</label>
              <div class="input-group">
                ${icon('lock')}
                <input class="input" type="password" id="login-pass" placeholder="••••••••" required />
              </div>
            </div>
            <div class="flex items-center justify-between" style="margin-bottom:20px">
              <label class="flex items-center gap-2" style="cursor:pointer;font-size:.85rem">
                <input type="checkbox" id="remember-me" style="accent-color:var(--primary);width:15px;height:15px" /> Remember me
              </label>
              <a href="#" class="btn btn-ghost btn-sm" onclick="event.preventDefault();App.forgotPassword()">Forgot password?</a>
            </div>
            <button class="btn btn-primary btn-lg btn-block" type="submit">${icon('log-in')} Sign In</button>
          </form>

          <div class="card card-pad" style="margin-top:22px;background:var(--bg-soft)">
            <div style="font-size:.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Secure Access</div>
            <p class="muted" style="margin:0;line-height:1.6;font-size:.85rem">
              Use the email and password assigned to your role. Only approved staff members should be able to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>`;
  },

  forgotPassword() {
    toast('Password Reset', 'A reset link has been sent to your email', 'info');
  },

  bindLoginEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value;
        this.login(email, pass);
      };
    }
  },

  
  renderShell() {
    const u = this.user;
    const navItems = [
      ['dashboard', 'layout-dashboard', 'Dashboard'],
      ['pos', 'shopping-cart', 'POS'],
      ['orders', 'receipt', 'Orders'],
      ['kitchen', 'chef-hat', 'Kitchen'],
      ['menu', 'coffee', 'Menu'],
      ['inventory', 'package', 'Inventory'],
      ['customers', 'users', 'Customers'],
      ['promotions', 'tag', 'Promotions'],
      ['reports', 'bar-chart-3', 'Reports'],
      ['users', 'user-cog', 'Users'],
      ['activity', 'history', 'Activity Log'],
      ['settings', 'settings', 'Settings'],
    ].filter(([r]) => this.hasPerm(r));

    const nav = navItems.map(([r, ic, label]) => `
      <button class="nav-item ${this.route===r?'active':''}" data-route="${r}">
        ${icon(ic)}
        <span>${label}</span>
        ${r==='orders' && this.orders.filter(o=>o.status==='Waiting'||o.status==='Preparing').length ? `<span class="nav-badge">${this.orders.filter(o=>o.status==='Waiting'||o.status==='Preparing').length}</span>` : ''}
      </button>`).join('');

    const unread = this.notifications.filter(n=>!n.read).length;

    const pageMeta = {
      dashboard: ['Dashboard', `Here's what's happening at ${STORE_INFO.name}`],
      pos: ['Point of Sale', 'Create new orders fast'],
      orders: ['Orders', 'Manage and track all orders'],
      kitchen: ['Kitchen Display', 'Live order status board'],
      menu: ['Menu Management', 'Products & pricing'],
      inventory: ['Inventory', 'Track your ingredients & supplies'],
      customers: ['Customers', 'Loyalty & customer profiles'],
      promotions: ['Promotions', 'Discounts and offers'],
      reports: ['Reports', 'Business insights & analytics'],
      users: ['User Management', 'Team & permissions'],
      activity: ['Activity Log', 'Audit trail — who did what, and when'],
      settings: ['Settings', 'Store configuration'],
    };
    const meta = pageMeta[this.route] || ['', ''];

    return `
    <div class="app-shell">
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">${icon('coffee', 22)}</div>
          <div>
            <div class="brand-name">BrewPOS</div>
            <div class="brand-sub">Coffee Shop POS</div>
          </div>
        </div>
        <div class="sidebar-user">
          ${avatarHtml(u.name, u.color, 38)}
          <div style="min-width:0">
            <div class="truncate fw-700" style="font-size:.85rem">${u.name}</div>
            <div class="badge badge-primary" style="margin-top:3px">${u.role}</div>
          </div>
        </div>
        <div class="nav-section">Main Menu</div>
        <nav>
          ${nav}
        </nav>
        <div class="sidebar-foot">
          <button class="nav-item" onclick="App.logout()">
            ${icon('log-out')} <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <button class="icon-btn menu-btn" onclick="openDrawer()" title="Menu">${icon('menu', 22)}</button>
          <div style="min-width:0">
            <div class="topbar-title truncate">${meta[0]}</div>
            <div class="topbar-sub truncate">${meta[1]}</div>
            ${this.route==='pos' && this.currentProductId ? (function(){ const p = App.products.find(x=>x.id===App.currentProductId) || {}; return `<div class="topbar-product truncate" title="${p.name||''}">${p.name||''}</div>` })() : ''}
          </div>
          ${this.route==='pos' ? `
          <div class="topbar-search">
            <div class="input-group">${icon('search')}
              <input class="input" id="pos-search" placeholder="Search products…" oninput="App.posSearch(this.value)" />
            </div>
          </div>` : ''}
          <div class="topbar-menu">
            <button class="connection-status connection-${this.connectionStatus}" onclick="App.retryConnection()" title="Click to refresh database connection">
              <span class="connection-dot"></span>
              <span>${this.connectionStatus === 'online' ? 'Online' : this.connectionStatus === 'offline' ? 'Offline' : 'Checking'}</span>
            </button>
            <div class="dropdown">
              <button class="icon-btn note-btn" onclick="App.toggleNotes(event)" title="Notifications">
                ${icon('bell')} ${unread ? `<span class="dot"></span>` : ''}
              </button>
              <div class="note-drop hidden" id="note-drop">
                <div class="flex items-center justify-between" style="padding:12px 14px;border-bottom:1px solid var(--border)">
                  <b style="font-size:.9rem">Notifications</b>
                  <button class="btn btn-ghost btn-sm" onclick="App.markAllRead()">Mark all read</button>
                </div>
                ${this.notifications.map(n => `
                  <div class="note-item" onclick="App.markRead('${n.id}')">
                    <div style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;background:var(--primary-soft);color:var(--primary)">
                      ${icon(this.noteIcon(n.type), 16)}
                    </div>
                    <div style="min-width:0">
                      <div class="fw-700" style="font-size:.82rem">${n.title} ${n.read?'':'<span class="badge-dot" style="background:var(--primary);margin-left:4px"></span>'}</div>
                      <div class="muted text-xs" style="margin-top:2px">${n.msg}</div>
                      <div class="muted text-xs" style="margin-top:2px;font-size:.7rem">${n.time}</div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>
            <button class="icon-btn" onclick="App.toggleTheme()" title="Toggle theme">${icon(document.documentElement.getAttribute('data-theme')==='dark'?'sun':'moon', 19)}</button>
            ${this.route==='pos' ? `<button class="icon-btn cart-open-btn" onclick="App.toggleMobileCart()" style="position:static;display:none">${icon('shopping-cart')} <span class="count" id="cart-mobile-count" style="display:none">0</span></button>` : ''}
            <div class="dropdown">
              <div class="avatar-topbar" style="background:${u.color}" onclick="App.toggleUserMenu(event)">${initials(u.name)}</div>
              <div class="dropdown-menu hidden" id="user-menu">
                <div style="padding:10px 12px;border-bottom:1px solid var(--border);margin-bottom:6px">
                  <div class="fw-700" style="font-size:.86rem">${u.name}</div>
                  <div class="muted text-xs">${u.email}</div>
                </div>
                <button class="dropdown-item" onclick="App.navigate('settings')">${icon('settings')} Settings</button>
                <button class="dropdown-item danger" onclick="App.logout()">${icon('log-out')} Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        <main class="main-content" id="main-content">
          <div id="page-content">${this.renderSkeleton()}</div>
        </main>
      </div>
    </div>`;
  },

  noteIcon(type) {
    return { order:'bell', ready:'check-circle-2', stock:'alert-triangle', payment:'credit-card', sales:'trending-up' }[type] || 'bell';
  },

  toggleNotes(e) {
    e.stopPropagation();
    document.getElementById('note-drop').classList.toggle('hidden');
  },

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.render();
    toast('Notifications', 'All marked as read', 'success');
  },

  markRead(id) {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
    document.getElementById('note-drop').innerHTML = '';
    this.render();
  },

  toggleUserMenu(e) {
    e.stopPropagation();
    document.getElementById('user-menu').classList.toggle('hidden');
  },

  bindShellEvents() {
    this.bindLoginEvents();
    
    document.querySelectorAll('.nav-item[data-route]').forEach(el => {
      el.onclick = () => this.navigate(el.dataset.route);
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu, .note-drop').forEach(el => el.classList.add('hidden'));
      }
    });
  },

  renderSkeleton() {
    const pages = {
      dashboard: () => skeletonCards(8),
      pos: () => skeletonCards(6),
      orders: () => skeletonRows(6),
      kitchen: () => skeletonRows(4),
      menu: () => skeletonRows(6),
      inventory: () => skeletonRows(6),
      customers: () => skeletonRows(6),
      promotions: () => skeletonRows(4),
      reports: () => skeletonCards(4),
      users: () => skeletonRows(5),
      settings: () => skeletonRows(4),
    };
    return (pages[this.route] || pages.dashboard)();
  },

  
  startKitchenTimer() {
    if (this.kitchenTimer) return;
    this.kitchenTimer = setInterval(() => {
      document.querySelectorAll('[data-timer]').forEach(el => {
        const start = parseInt(el.dataset.timer);
        const secs = Math.floor((Date.now() - start) / 1000);
        el.textContent = this.fmtTime(secs);
      });
    }, 1000);
  },
  stopKitchenTimer() { if (this.kitchenTimer) { clearInterval(this.kitchenTimer); this.kitchenTimer = null; } },
  fmtTime(s) {
    const m = Math.floor(s/60), sec = s%60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  },

  
  toggleMobileCart() {
    const p = document.getElementById('cart-panel');
    if (p) p.classList.toggle('open');
  },

  
  renderPage() {
    const content = document.getElementById('page-content');
    setTimeout(() => {
      const fn = Pages[this.route];
      if (fn) content.innerHTML = fn.call(Pages);
      else content.innerHTML = '<div class="empty-state">Page not found</div>';
      refreshIcons();
      Pages.afterRender && Pages.afterRender();
    }, 180);
  },

  
  total(cart) {
    const items = cart || [];
    const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || item.price * item.qty), 0);
    const code = (this.promoCode || '').trim().toUpperCase();
    const matchedPromo = code ? this.promos.find(p => p.status === 'Active' && (p.code || '').toUpperCase() === code) : null;
    const eligibleItems = matchedPromo ? items.filter(item => this.promoAppliesToItem(matchedPromo, item)) : [];
    const promo = eligibleItems.length ? matchedPromo : null;
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.lineTotal || item.price * item.qty), 0);
    let discount = 0;
    if (promo?.type === 'B1G1') {
      const unitPrices = eligibleItems.flatMap(item => Array(Math.max(0, Number(item.qty) || 0)).fill(Number(item.price) || 0)).sort((a, b) => a - b);
      discount = unitPrices.slice(0, Math.floor(unitPrices.length / 2)).reduce((sum, price) => sum + price, 0);
    } else if (promo) {
      discount = eligibleSubtotal * (Math.min(100, Math.max(0, Number(promo.discount) || 0)) / 100);
    }
    const tax = (subtotal - discount) * STORE_INFO.taxRate;
    return { subtotal, discount, tax, total: subtotal - discount + tax, promo, eligibleSubtotal };
  },

  promoAppliesToItem(promo, item) {
    const applies = String(promo.applies || 'all').toLowerCase();
    const product = this.products.find(p => p.name === item.name);
    const category = String(product?.cat || '').toLowerCase();
    const name = String(item.name || '').toLowerCase();
    if (applies === 'all' || applies === 'upgrade') return true;
    if (applies === 'drinks') return !['pastries', 'cakes', 'sandwiches'].includes(category);
    if (applies === 'frappes') return category === 'frappes';
    if (applies === 'peppermint') return name.includes('peppermint');
    return category === applies || name.includes(applies);
  },

  getApplicablePromos(cart) {
    const items = cart || [];
    return this.promos.filter(p => p.status === 'Active' && items.some(item => this.promoAppliesToItem(p, item)));
  },

  selectPromoCode(code) {
    this.promoCode = (code || '').trim().toUpperCase();
    this.render();
    const promo = this.promos.find(p => p.status === 'Active' && (p.code || '').toUpperCase() === this.promoCode);
    if (promo) toast('Promotion applied', `${promo.name} applied to eligible items.`, 'success');
  },

  applyPromoCode() {
    const input = document.getElementById('promo-code-input');
    const code = (input?.value || '').trim().toUpperCase();
    if (!code) {
      this.promoCode = '';
      this.render();
      return;
    }
    const promo = this.promos.find(p => p.status === 'Active' && (p.code || '').toUpperCase() === code);
    if (!promo) {
      toast('Invalid promotion', 'That promo code is inactive or does not exist.', 'error');
      return;
    }
    this.promoCode = code;
    const eligible = this.cart.filter(item => this.promoAppliesToItem(promo, item));
    if (!eligible.length) {
      this.promoCode = '';
      toast('Promotion not applicable', `This promotion does not apply to the items in your cart.`, 'warning');
      return;
    }
    this.render();
    toast('Promotion applied', `${promo.name} applied to eligible items.`, 'success');
  },

  clearPromoCode() {
    this.promoCode = '';
    this.render();
  },

  setCat(cat) { this.activeCat = cat; this.render(); },
  posSearch(q) { this.search = q; this.render(); },

  changeQty(idx, d) {
    if (!this.cart[idx]) return;
    this.cart[idx].qty += d;
    if (this.cart[idx].qty <= 0) this.cart.splice(idx, 1);
    else this.cart[idx].lineTotal = this.cart[idx].qty * this.cart[idx].price;
    this.saveCart();
    this.render();
  },
  removeItem(idx) {
    confirmDialog({ title:'Remove Item?', message:`Remove ${this.cart[idx].qty}× ${this.cart[idx].name} from order?`, confirmText:'Remove', danger:true, onConfirm:()=>{ App.cart.splice(idx, 1); App.saveCart(); App.render(); toast('Item removed','','info'); }});
  },
  clearCart() {
    if (!this.cart.length) return;
    confirmDialog({ title:'Clear Cart?', message:'All items in the current order will be removed.', confirmText:'Clear', danger:true, onConfirm:()=>{ App.cart = []; App.promoCode = ''; App.saveCart(); App.render(); toast('Cart cleared','Start a new order','info'); }});
  },
  async holdOrder() {
    try {
      if (!this.cart.length) { toast('Empty cart','Add items before holding','error'); return; }
      const sum = this.total(this.cart);
      const customer = (this.cartCustomer || 'Walk-in').trim();
      const orderNum = nextOrderNumber();
      const order = {
        id: orderNum, qnum: 'H-'+orderNum.split('-')[1], customer: customer,
        type:'Hold', status:'Hold', items: this.cart.map(i=>({name:i.name, qty:i.qty, price:i.price, cust:[i.size,i.temp,i.extras&&i.extras.join(', ')].filter(Boolean).join(' · ')})),
        total: sum.total, payment:'—', cashier:this.user.name, time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), date:new Date().toISOString().slice(0,10), hold:true,
      };
      let saved = true;
      try { await apiRequest('POST', 'api/orders.php', order); }
      catch (dbErr) { saved = false; console.warn('Held order not saved to database:', dbErr.message); }
      this.orders.unshift(order);
      this.cart = [];
      this.promoCode = '';
      this.saveCart();
      this.render();
      toast(saved ? 'Order Held' : 'Held locally only', saved ? `${order.id} saved. Resume anytime from Orders.` : `${order.id} held in this browser only — database wasn't reachable.`, saved ? 'success' : 'warning');
    } catch(e) {
      console.error('Hold order error:', e);
      toast('Error', 'Failed to hold order. Please try again.', 'error');
    }
  },
  async resumeOrder(id) {
    try {
      const o = this.orders.find(x=>x.id===id);
      if (!o) { toast('Error', 'Order not found', 'error'); return; }
      this.cart = o.items.map(i => {
        const prod = this.products.find(x => x.name === i.name);
        return { name:i.name, price:i.price, qty:i.qty, emoji:prod ? prod.emoji : '☕', img:prod ? prod.img : '', size:'', temp:'', extras:[], note:'', lineTotal:i.price*i.qty };
      });
      this.cartCustomer = o.customer;
      this.orders = this.orders.filter(x=>x.id!==id);
      this.saveCart();
      this.route='pos';
      this.render();
      toast('Order resumed', `${id} loaded into cart`, 'success');
      try { await apiRequest('DELETE', 'api/orders.php?id=' + encodeURIComponent(id)); }
      catch (dbErr) { console.warn('Could not remove held order from database:', dbErr.message); }
    } catch(e) {
      console.error('Resume order error:', e);
      toast('Error', 'Failed to resume order', 'error');
    }
  },
  viewOrder(id) {
    const o = this.orders.find(x=>x.id===id); if(!o) return;
    openModal(`
      <div class="modal-head">
        <div><h3>${o.id}</h3><span class="muted text-xs">${o.qnum} · ${o.customer} · ${o.type}</span></div>
        <button class="modal-close" onclick="closeModal()">${icon('x')}</button>
      </div>
      <div class="modal-body">
        ${o.items.map(i=>`
          <div class="list-row">
            <div style="flex:1;min-width:0">
              <div class="fw-700" style="font-size:.9rem">${i.qty}× ${i.name}</div>
              ${i.cust?`<div class="muted text-xs">${i.cust}</div>`:''}
            </div>
            <b>${money(i.price*i.qty)}</b>
          </div>`).join('')}
        <div class="flex items-center justify-between" style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border)">
          <b>Total (${o.payment})</b><b style="font-size:1.1rem">${money(o.total)}</b>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="App.printReceipt('${o.id}')">${icon('printer')} Print Receipt</button>
      </div>
    `);
  },

  chooseCustomer() {
    openModal(`
      <div class="modal-head"><h3>Select Customer</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body">
        <button class="btn btn-ghost btn-block" style="justify-content:flex-start;margin-bottom:8px" onclick="App.setCustomer('Walk-in')">${icon('user')} Walk-in Customer</button>
        ${App.customers.map(c=>`
          <button class="btn btn-ghost btn-block" style="justify-content:flex-start;margin-bottom:6px" onclick="App.setCustomer('${c.name}')">
            ${avatarHtml(c.name,'#6F4E37',28)} ${c.name} <span class="muted text-xs"> · ${c.points} pts</span>
          </button>`).join('')}
      </div>
    `);
  },
  setCustomer(name) { this.cartCustomer = name; closeModal(); this.render(); },

  checkCartAvailability() {
    const blocked = this.cart.filter(item => {
      const product = this.products.find(p => p.name === item.name);
      return !product || product.available === false;
    });

    if (!blocked.length) return true;
    const names = blocked.slice(0,3).map(i => i.name).join(', ');
    const extra = blocked.length > 3 ? ` +${blocked.length - 3} more` : '';
    toast('Unavailable item', `${names}${extra} can't be sold right now.`, 'error');
    return false;
  },

  checkout() {
    if (!this.cart.length) { toast('Empty cart','Add items to checkout','error'); return; }
    if (!this.checkCartAvailability()) return;
    const sum = this.total(this.cart);
    const paymentHtml = `
      <div class="modal-head">
        <div><h3>Checkout</h3><span class="muted text-xs">${this.cartCustomer} · ${this.cart.reduce((a,b)=>a+b.qty,0)} items</span></div>
        <button class="modal-close" onclick="closeModal()">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="flex items-center justify-between" style="background:var(--primary-soft);padding:14px 16px;border-radius:14px;margin-bottom:18px">
          <span class="fw-700">Grand Total</span>
          <span class="fw-800" style="font-size:1.5rem;font-family:var(--font-display)">${money(sum.total)}</span>
        </div>
        <div class="pay-options" id="pay-options">
          <button class="pay-option active" data-pay="Cash" onclick="Pages.selectPayment('Cash', this)">${icon('banknote',28)} Cash</button>
          <button class="pay-option" data-pay="Credit Card" onclick="Pages.selectPayment('Credit Card', this)">${icon('credit-card',28)} Credit Card</button>
          <button class="pay-option" data-pay="Debit Card" onclick="Pages.selectPayment('Debit Card', this)">${icon('credit-card',28)} Debit Card</button>
          <button class="pay-option" data-pay="GCash" onclick="Pages.selectPayment('GCash', this)">${icon('smartphone',28)} GCash</button>
          <button class="pay-option" data-pay="Maya" onclick="Pages.selectPayment('Maya', this)">${icon('smartphone',28)} Maya</button>
          <button class="pay-option qr" data-pay="QR Code" onclick="Pages.selectPayment('QR Code', this)">${icon('qr-code',28)} QR Code</button>
        </div>
        <div class="field" style="margin-top:16px;margin-bottom:10px">
          <label class="checkbox-row" style="display:flex;align-items:center;gap:10px;cursor:pointer">
            <input type="checkbox" id="split-payment-toggle" onchange="Pages.toggleSplitPayment(this.checked)" />
            <span>Split payment</span>
          </label>
        </div>
        <div id="split-payment-section" style="display:none;border:1px solid var(--border);border-radius:12px;padding:12px;background:var(--bg-soft);margin-bottom:14px">
          <div class="field">
            <label>Cash portion</label>
            <input class="input" id="split-cash-input" type="number" min="0" step="0.01" value="0" oninput="Pages.updateSplitAmounts()" />
          </div>
          <div class="field">
            <label>${Pages._payment === 'Cash' ? 'Card / Wallet portion' : 'Additional amount'}</label>
            <input class="input" id="split-card-input" type="number" min="0" step="0.01" value="0" oninput="Pages.updateSplitAmounts()" />
          </div>
          <div class="flex items-center justify-between" style="margin-top:8px;font-size:.8rem;color:var(--muted)">
            <span>Remaining</span>
            <b id="split-remaining">${money(sum.total)}</b>
          </div>
        </div>
        <div id="pay-cash-section" style="margin-top:16px">
          <div class="field"><label>Cash Received</label>
            <div class="pay-calc">
              <input class="input" id="cash-given" type="number" min="${sum.total}" value="${Math.ceil(sum.total)}" oninput="Pages.updateChange()" />
              <button class="btn btn-ghost" onclick="document.getElementById('cash-given').value=${Math.ceil(sum.total)};Pages.updateChange()">Exact</button>
            </div>
            <div class="quick-cash-row" style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
              ${[50,100,200,300,500,1000].map(v => `
                <button type="button" class="btn btn-ghost btn-sm" style="flex:1;min-width:60px" onclick="document.getElementById('cash-given').value=${v};Pages.updateChange()">₱${v}</button>
              `).join('')}
            </div>
          </div>
          <div class="flex items-center justify-between" style="background:var(--bg-soft);padding:12px 14px;border-radius:12px">
            <span class="fw-700">Change</span>
            <span class="fw-800" style="font-size:1.2rem;color:var(--success)" id="change-amt">${money(0)}</span>
          </div>
        </div>
        <div id="pay-qr-section" style="display:none;margin-top:16px;text-align:center">
          <div class="qr-box" id="checkout-qr-box"></div>
          <p class="muted text-sm" style="margin-top:10px">Scan with GCash / Maya to pay ${money(sum.total)}</p>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary btn-lg" onclick="App.completePayment()">${icon('check')} Confirm Payment</button>
      </div>`;
    Pages._payment = 'Cash';
    Pages._splitEnabled = false;
    openModal(paymentHtml, { width:'520px' });
    Pages.updateChange();
    this.renderCheckoutQR(sum.total);
  },

  
  renderCheckoutQR(amount) {
    const box = document.getElementById('checkout-qr-box');
    if (!box) return;
    if (typeof qrcode === 'undefined') {
      console.error('BrewPOS: qrcode library is undefined — js/app.js did not load correctly.');
      box.innerHTML = `${icon('qr-code', 60)}<div class="muted text-xs" style="margin-top:8px">QR library not loaded</div>`;
      return;
    }
    const payload = `${STORE_INFO.name} | Amount Due: ${money(amount)} | Ref: ${new Date().getTime()}`;
    try {
      const qr = qrcode(0, 'M');
      qr.addData(payload);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4 });
    } catch (e) {
      console.error('BrewPOS checkout QR error:', e);
      box.innerHTML = `${icon('qr-code', 60)}`;
    }
  },

  async completePayment() {
    try {
      if (!this.cart.length) { toast('Empty cart','Add items to checkout','error'); return; }
      if (!this.checkCartAvailability()) return;
      const sum = this.total(this.cart);
      const pay = Pages._payment || 'Cash';
      const splitEnabled = !!Pages._splitEnabled;
      let cashGiven = 0;
      let splitPayment = [];
      let change = 0;

      if (sum.total <= 0) { toast('Invalid Order','Order total must be greater than 0','error'); return; }

      if (splitEnabled) {
        const cashPart = Math.max(0, Number(document.getElementById('split-cash-input')?.value || 0));
        const otherPart = Math.max(0, Number(document.getElementById('split-card-input')?.value || 0));
        const combined = cashPart + otherPart;
        if (combined < sum.total - 0.01) {
          toast('Split payment incomplete', `Add ${money(sum.total - combined)} more to complete payment.`, 'error');
          return;
        }
        cashGiven = cashPart;
        const primaryMethod = pay === 'Cash' ? 'Credit Card' : pay;
        splitPayment = [
          ...(cashPart > 0 ? [{ method: 'Cash', amount: cashPart }] : []),
          ...(otherPart > 0 ? [{ method: primaryMethod, amount: otherPart }] : []),
        ];
        change = Math.max(0, cashPart - (sum.total - otherPart));
      } else if (pay === 'Cash') {
        cashGiven = Number(document.getElementById('cash-given').value) || 0;
        if (!cashGiven || cashGiven < sum.total) { toast('Insufficient','Cash received is less than total','error'); return; }
        change = Math.max(0, cashGiven - sum.total);
      }

      const customer = (this.cartCustomer || 'Walk-in').trim();
      const orderNum = nextOrderNumber();
      const order = {
        id: orderNum, qnum: 'A-'+orderNum.split('-')[1], customer: customer,
        type: customer==='Walk-in' ? 'Takeaway' : 'Dine-in', status:'Waiting',
        items: this.cart.map(i=>({name:i.name, qty:i.qty, price:i.price, cust:[i.size,i.temp,i.sugar,i.ice,i.milk,i.extras&&i.extras.join(', ')].filter(Boolean).join(' · ')})),
        total: sum.total,
        payment: splitEnabled ? 'Split' : pay,
        cashier:this.user.name,
        cashGiven,
        change,
        payments: splitPayment.length ? splitPayment : [{ method: pay, amount: sum.total }],
        time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
        date:new Date().toISOString().slice(0,10),
        hold:false,
      };
      let saved = true;
      try {
        await apiRequest('POST', 'api/orders.php', order);
        try {
          const freshInventory = await apiRequest('GET', 'api/inventory.php');
          if (Array.isArray(freshInventory)) this.inventory = freshInventory;
          this.checkLowStockNotifications();
        } catch (invErr) {  }
      }
      catch (dbErr) { saved = false; console.warn('Order not saved to database:', dbErr.message); }
      this.orders.unshift(order);
      this.notifications.unshift({ id:'n'+Date.now(), type:'order', title:'New Order', msg:`${order.id} · ${money(sum.total)}`, time:'just now', read:false });
      this.cart = [];
      this.promoCode = '';
      this.saveCart();
      closeModal();
      this.render();
      toast(saved ? 'Payment Successful' : 'Payment recorded locally only', saved ? `${order.id} confirmed via ${order.payment}` : `${order.id} confirmed, but the database wasn't reachable — it won't persist after refresh.`, saved ? 'success' : 'warning');
      this.showPaymentSuccess(order);
    } catch(e) {
      console.error('Payment error:', e);
      toast('Payment Error', 'An error occurred during payment. Please try again.', 'error');
    }
  },

  
  showPaymentSuccess(order) {
    const total = order.total;
    const isSplit = order.payment === 'Split';
    const cashReceived = isSplit
      ? (order.payments || []).filter(p => p.method === 'Cash').reduce((sum, p) => sum + (p.amount || 0), 0)
      : (order.cashGiven || total);
    const change = Math.max(0, order.change || (cashReceived - total));
    const paymentLine = isSplit ? (order.payments || []).map(p => `${p.method}: ${money(p.amount)}`).join(' · ') : order.payment;

    openModal(`
      <div class="modal-head">
        <div><h3>Payment Successful</h3></div>
        <button class="modal-close" onclick="closeModal()">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="pay-success">
          <div class="ring">
            <div class="check">${icon('check', 26)}</div>
          </div>
          <div class="amount">${money(total)}</div>
          <div class="meta">${paymentLine} · ${order.id}</div>
          ${(isSplit || order.payment === 'Cash') ? `<div class="meta" style="margin-top:4px">Cash received: <b>${money(cashReceived)}</b> · Change: <b style="color:var(--success)">${money(change)}</b></div>` : ''}
          <div class="spinner-ring"></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="App.showReceipt('${order.id}')">${icon('receipt')} View Receipt</button>
        <button class="btn btn-primary btn-lg" onclick="App.showReceipt('${order.id}')">${icon('printer')} Print Receipt</button>
      </div>
    `, { width:'400px' });
    App.launchConfetti();
    setTimeout(() => App.showReceipt(order.id), 2600);
  },

  launchConfetti() {
    const colors = ['#6F4E37','#D2B48C','#22C55E','#F59E0B','#EF4444','#3B82F6','#A855F7'];
    const root = document.createElement('div');
    root.className = 'confetti';
    document.body.appendChild(root);
    for (let i=0;i<60;i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `left:${Math.random()*100}vw;background:${colors[i%colors.length]};animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*0.4}s;transform:rotate(${Math.random()*360}deg)`;
      root.appendChild(piece);
    }
    setTimeout(() => root.remove(), 5000);
  },

  showReceipt(orderOrId) {
    const order = typeof orderOrId === 'string' ? this.orders.find(x=>x.id===orderOrId) : orderOrId;
    if (!order) return;
    this.receiptPaper = this.receiptPaper || 'thermal'; 
    const sum = { subtotal: order.total - order.total*STORE_INFO.taxRate, tax: order.total*STORE_INFO.taxRate, total: order.total };
    const itemRows = (order.items || []).map(item => `
          <div class="receipt-line">
            <span>${item.qty}× ${item.name}${item.cust ? `<small>${item.cust}</small>` : ''}</span>
            <span>${money(item.price * item.qty)}</span>
          </div>`).join('');
    const receiptHtml = `
      <div style="font-family:'Courier New',monospace;font-size:12px;color:var(--text)">
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:800">${STORE_INFO.name}</div>
          <div>${STORE_INFO.address}</div>
          <div>${STORE_INFO.phone}</div>
          <div>TIN: ${STORE_INFO.tin}</div>
        </div>
        <hr style="border-top:1px dashed var(--border)">
        <div>Order: ${order.id}</div>
        <div>Queue: ${order.qnum}</div>
        <div>Date: ${new Date().toLocaleString()}</div>
        <div>Cashier: ${order.cashier}</div>
        <hr style="border-top:1px dashed var(--border)">
        <div>${itemRows}</div>
        <hr style="border-top:1px dashed var(--border)">
        <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${money(sum.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Tax</span><span>${money(sum.tax)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;margin-top:4px"><span>TOTAL</span><span>${money(sum.total)}</span></div>
        <div>Payment: ${order.payment}</div>
<hr style="border-top:1px dashed var(--border)">
        <div style="text-align:center">${STORE_INFO.receiptFooter}</div>
      </div>`;
    openModal(`
      <div class="modal-head"><h3>Receipt</h3><button class="modal-close" onclick="closeModal()">${icon('x')}</button></div>
      <div class="modal-body" style="max-height:60vh;overflow-y:auto">${receiptHtml}</div>
      <div class="flex gap-2" style="padding:0 20px 4px">
        <button class="btn btn-ghost btn-sm ${this.receiptPaper==='thermal'?'active':''}" style="flex:1" onclick="App.receiptPaper='thermal';App.showReceipt('${order.id}')">${icon('smartphone',14)} Thermal (58/80mm)</button>
        <button class="btn btn-ghost btn-sm ${this.receiptPaper==='a4'?'active':''}" style="flex:1" onclick="App.receiptPaper='a4';App.showReceipt('${order.id}')">${icon('file',14)} A4 / Letter</button>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="App.printReceiptNow()">${icon('printer')} Print</button>
      </div>
    `, { width:'380px' });
    
    
    
    const printRoot = document.getElementById('print-receipt-root');
    if (printRoot) {
      printRoot.className = 'print-only paper-' + this.receiptPaper;
      printRoot.innerHTML = receiptHtml;
    }
  },
  printReceiptNow() {
    window.print();
  },
  printReceipt(id) {
    const o = this.orders.find(x=>x.id===id); if(!o) return;
    this.showReceipt(o);
  },

  
  async setOrderStatus(id, status) {
    const o = this.orders.find(x=>x.id===id); if(!o) return;
    o.status = status;
    if (status === 'Ready') this.notifications.unshift({ id:'n'+Date.now(), type:'ready', title:'Order Ready', msg:`${o.qnum} for ${o.customer}`, time:'just now', read:false });
    if (status === 'Completed') toast('Order completed', `${o.id} finished`, 'success');
    if (App.route === 'kitchen') this.render();
    else this.render();
    try { await apiRequest('PUT', 'api/orders.php', { id, status }); }
    catch (dbErr) { console.warn('Order status change not saved to database:', dbErr.message); toast('Not saved to database', 'Status changed here only — check your XAMPP connection.', 'warning'); }
  },

  



  confirmVoidOrder(id) {
    const o = this.orders.find(x=>x.id===id); if (!o) return;
    confirmDialog({
      title: 'Void this order?',
      message: `${o.id} (${money(o.total)}) will be marked Voided and its ingredients will be added back to inventory. This can't be undone from here.`,
      confirmText: 'Void Order',
      danger: true,
      onConfirm: () => App.voidOrder(id),
    });
  },
  async voidOrder(id) {
    const o = this.orders.find(x=>x.id===id); if (!o) return;
    try {
      await apiRequest('PUT', 'api/orders.php', { id, status: 'Voided' });
      o.status = 'Voided';
      toast('Order Voided', `${o.id} voided — stock restored`, 'success');
      try {
        const freshInventory = await apiRequest('GET', 'api/inventory.php');
        if (Array.isArray(freshInventory)) this.inventory = freshInventory;
      } catch (invErr) {  }
      this.render();
    } catch (err) {
      toast('Could not void order', err.message, 'error');
    }
  },

  
  handleDrag(ev, id) {
    ev.dataTransfer.setData('text/plain', id);
    ev.target.closest('.kitchen-card').classList.add('dragging');
  },
  async handleDrop(ev, status) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const id = ev.dataTransfer.getData('text/plain');
    const o = this.orders.find(x=>x.id===id);
    if (o && o.status !== status) {
      o.status = status;
      if (status==='Ready') this.notifications.unshift({ id:'n'+Date.now(), type:'ready', title:'Order Ready', msg:`${o.qnum} for ${o.customer}`, time:'just now', read:false });
      this.render();
      toast('Order moved', `${o.qnum} → ${status}`, 'success');
      try { await apiRequest('PUT', 'api/orders.php', { id, status }); }
      catch (dbErr) { console.warn('Order status change not saved to database:', dbErr.message); toast('Not saved to database', 'Status changed here only — check your XAMPP connection.', 'warning'); }
    }
  },
};


document.addEventListener('DOMContentLoaded', () => { App.init(); });