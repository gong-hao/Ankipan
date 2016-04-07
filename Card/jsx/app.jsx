(function() {
    'use strict';

    $(window).keydown(function(e) {
        var key = checkCode(e);

        if (key.isCtrl) core.isCtrlDown = true;
        if (key.isShift) core.isShiftlDown = true;
        if (key.isAlt) core.isAltDown = true;

        if (key.isLeft) cardEntity._move(-1);
        if (key.isUp) cardEntity._toggleProp('IsShowExplain');
        if (key.isDown) cardEntity._toggleProp('IsShowWord');
        if (key.isRight) cardEntity._move(1);

        if (key.isCtrl) cardEntity._speak();
        if (key.isTilde) cardEntity._speak('SSU');
        if (key.is1) cardEntity._speak('google');
        if (key.is2) cardEntity._speak('usenglishfemale');
        if (key.is3) cardEntity._speak('usenglishmale');
        if (key.is4) cardEntity._speak('ukenglishfemale');
        if (key.is5) cardEntity._speak('ukenglishmale');
    });

    $(window).keyup(function(e) {
        var key = checkCode(e);

        if (key.isCtrl) core.isCtrlDown = false;
        if (key.isShift) core.isShiftlDown = false;
        if (key.isAlt) core.isAltDown = false;
    });

    function checkCode(e) {
        return {
            isF2: e.keyCode === 113,
            isF9: e.keyCode === 120,
            isF10: e.keyCode === 121,
            isShift: e.keyCode === 16,
            isCtrl: e.keyCode === 17,
            isAlt: e.keyCode === 18,
            isEsc: e.keyCode === 27,
            isUp: e.keyCode === 38,
            isDown: e.keyCode === 40,
            isLeft: e.keyCode === 37,
            isRight: e.keyCode === 39,
            isQ: e.keyCode === 81,
            isW: e.keyCode === 87,
            isE: e.keyCode === 69,
            isR: e.keyCode === 82,
            is1: e.keyCode === 49,
            is2: e.keyCode === 50,
            is3: e.keyCode === 51,
            is4: e.keyCode === 52,
            is5: e.keyCode === 53,
            isTilde: e.keyCode === 192
        };
    };

    function getMode() {
        if (!core.mode) {
            return {
                isShowImage: true,
                isShowWord: true,
                isShowExplain: true
            }
        }

        return {
            isShowImage: core.mode.indexOf('i') !== -1,
            isShowWord: core.mode.indexOf('w') !== -1,
            isShowExplain: core.mode.indexOf('e') !== -1
        }
    }

    var Pi = React.createClass({
        componentDidUpdate: function(prevProps) {
            if (!this.props.data) return false;

            if (prevProps.word === this.props.word) return false;

            var piDom = this.refs.pi.getDOMNode();

            var piChart = echarts.init(piDom);

            var option = {
                series: [
                    {
                        type: 'pie',
                        radius: '40%',
                        center: ['50%', '50%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                    formatter: '{b}\n{d}%'
                                }
                            }
                        },
                        data: this.props.data
                    }
                ]
            };

            piChart.setOption(option);
        },
        render: function() {
            return (
                <div style={{ 'textAlign': 'center' }}>
                    <div ref="pi" style={{ width: 360, height: 360, display: 'inline-block' }}></div>
                </div>
            );
        }
    });

    var Avatars = React.createClass({
        render: function() {
            var isNeedShow = this.props.Current && this.props.Current.Avatars && this.props.Current.Avatars.length > 0;

            if (!isNeedShow) return false;

            return (
                <div style={{ 'display': (this.props.IsShowImage ? 'block' : 'none') }}>
                    <div className="avatar-area">
                        <ul className="avatar-list">
                            {this.props.Current.Avatars.map(function(ava, key) {
                                return (
                                    <li className="avatar-item" key={'avatar-' + key}>
                                        <img src={ava.Src} />
                                    </li>
                                );
                            }, this) }
                        </ul>
                    </div>
                    <hr />
                </div>
            );
        }
    });

    var DifficultyIndex = React.createClass({
        getDifficultyColor: function(index) {
            if (index >= 0 && index <= 20) return '#ffffff';
            if (index > 20 && index <= 40) return '#1eff00';
            if (index > 40 && index <= 60) return '#0081ff';
            if (index > 60 && index <= 80) return '#c600ff';
            if (index > 80 && index <= 100) return '#ff8000';
        },
        getDifficultyName: function(index) {
            if (index > 0 && index <= 20) return '普通';
            if (index > 20 && index <= 40) return '優秀';
            if (index > 40 && index <= 60) return '精良';
            if (index > 60 && index <= 80) return '史詩';
            if (index > 80 && index <= 100) return '傳奇';
        },
        render: function() {
            var isNeedShow = this.props.Current;

            if (!isNeedShow) return false;

            return (
                <div>
                    <div className="star-ratings-sprite">
                        <span style={{ width: (this.props.Current.DifficultyIndex || 0) + '%' }} className="rating"></span>
                    </div>
                    <span className="badge word-diff" style={{ backgroundColor: '#000', color: this.getDifficultyColor(this.props.Current.DifficultyIndex) }}>
                        {this.props.Current.DifficultyIndex || '??'} 等 {this.getDifficultyName(this.props.Current.DifficultyIndex) } 單字
                    </span>
                </div>
            );
        }
    });

    var Tester = React.createClass({
        _testChange: function(e) {
            if (!this.props.Current.TestWord) {
                this.props.Current.TestWord = '';
            }

            var len = e.target.value.length;

            var isEnd = e.target.value.length === this.props.Current.Word.length;

            var isPass = this.props.Current.Word.substr(0, len).toLowerCase() === e.target.value.toLowerCase();

            this.props.Current.TestWord = isPass ? e.target.value : 'Fail';

            this.props.Current.TestWordColor = isPass ? 'green' : 'red';

            if (isPass) {
                playAudio('combo');

                if (isEnd) {
                    playAudio('clear');

                    this.props.Current.TestWord = '[' + this.props.Current.TestWord + ']';

                    e.target.value = '';
                }
            } else {
                playAudio('miss');
            }

            cardEntity.setProps({
                Current: this.props.Current
            });
        },

        render: function() {
            return (
                <div style={{ 'display': (this.props.IsShowTestWord ? 'block' : 'none') }}>
                    <h2 style={{ 'textAlign': 'center', 'color': this.props.Current.TestWordColor }}>
                        {this.props.Current.TestWord}
                    </h2>
                    <h2 style={{ 'textAlign': 'center' }}>
                        <input type="text" style={{ 'textAlign': 'center' }} onChange={this._testChange} />
                    </h2>
                </div>
            );
        }
    });


    var Card = React.createClass({
        _changeAvatar: function(index) {
            for (var i = 0; i < this.props.Current.Avatars.length; i++) {
                var avatar = this.props.Current.Avatars[i];

                avatar.isShow = i === index;
            }

            this.setProps({
                Current: this.props.Current
            })
        },
        _appendWordsProp: function(words) {
            for (var i = 0; i < words.length; i++) {
                var word = words[i];

                for (var j = 0; j < word.Avatars.length; j++) {
                    var avatar = word.Avatars[j];

                    avatar.isShow = j === 0;
                };
            };

            return words;
        },
        _speak: function(voice) {
            if (voice) {
                core.speaker.voice = voice;
            }

            core.speaker.say(this.props.Current.Word);
        },
        _move: function(val) {
            var index = this.props.Index + val;

            var topIndex = 0;

            var lastIndex = this.props.Words.length - 1;

            var isTop = index === -1;

            var isLast = index === this.props.Words.length;

            index =
                isTop ? lastIndex :
                    isLast ? 0 : index;

            if (index >= 0 && index < this.props.Words.length) {

                var mode = getMode();

                this.setProps({
                    IsShowImage: mode.isShowImage,
                    IsShowWord: mode.isShowWord,
                    IsShowExplain: mode.isShowExplain,
                    Index: index,
                    Current: this.props.Words[index]
                });

                if (core.isAutoSpeak) {
                    setTimeout(function() {
                        this._speak(core.speaker.voice);
                    }.bind(this));
                }

                location.href = '#' + (index + 1);
            }
        },
        _archive: function() {
            //$.ajax({
            //    url: '/Api/Cihais/Archive?cihaiId=' + this.props.Current.CihaiId,
            //    type: 'POST',
            //    success: function () {
            //        this.props.Current.Archive = !this.props.Current.Archive;
            //
            //        this.setProps(this.props);
            //    }.bind(this)
            //});
        },
        _openAllLinks: function() {
            var word = this.props.Current.Word;

            [
                'http://learnersdictionary.com/definition/',
                'http://www.ldoceonline.com/search/?q=',
                'https://www.vocabulary.com/dictionary/',
                'http://www.dictionary.com/browse/',
                'http://www.ozdic.com/collocation-dictionary/',
                'http://www.thesaurus.com/browse/',
                'http://dict.cn/big5/'
            ].forEach(function(val, key) {
                var url = val + word;

                window.open(url);
            });
        },
        _toggleProp: function(propName) {
            var props = {};

            props[propName] = !this.props[propName];

            this.setProps(props);
        },
        _degree: function(type, degree) {
            //$.ajax({
            //    url: '/Api/Cihais/Degree?cihaiId=' + this.props.Current.CihaiId + '&type=' + type + '&degree=' + degree,
            //    type: 'POST',
            //    success: function () {
            //        switch (type)
            //        {
            //            case 1:
            //                this.props.Current.Pronunciation = degree;
            //
            //                break;
            //
            //            case 2:
            //                this.props.Current.Spelling = degree;
            //                break;
            //
            //            case 3:
            //                this.props.Current.Meaning = degree;
            //                break;
            //
            //            default:
            //                break;
            //        }
            //
            //        this.setProps(this.props);
            //    }.bind(this)
            //});
        },
        componentDidMount: function() {
            if (!core.groupName) {
                return false;
            }

            $.ajax({
                url: 'Json/' + core.groupName + '.json',
                type: 'GET',
                success: function(data) {
                    if (data && data.length > 0) {
                        var words = this._appendWordsProp(data);

                        var index = 0;

                        if (location.hash) {
                            var hashVal = location.hash.replace('#', '');

                            var isNumber = new RegExp(/\d/).test(hashVal);

                            if (isNumber) {
                                index = hashVal - 1;
                            } else {
                                index = _.findIndex(words, function(x) {
                                    return x.Word === hashVal;
                                });

                                index = index === -1 ? 0 : index;
                            }
                        }

                        var mode = getMode();

                        this.setProps({
                            IsShowImage: mode.isShowImage,
                            IsShowWord: mode.isShowWord,
                            IsShowExplain: mode.isShowExplain,
                            Index: index,
                            Current: words[index],
                            Words: words
                        });

                        setTimeout(function() {

                            if (core.isAutoSpeak) {
                                this._speak(core.speaker.voice);
                            }

                        }.bind(this), 50);
                    } else {
                        core.msg('group not found');
                    }
                }.bind(this)
            });
        },
        getDefaultProps: function() {
            return {
                IsShowImage: true,
                IsShowWord: true,
                IsShowExplain: true,
                IsShowSyllable: true,
                IsShowDifficultyIndex: true,
                IsShowSpeakBtn: false,
                IsShowTestWord: false,
                IsShowChartBasic: false,
                IsChartExamples: false,
                Index: 0,
                Current: {},
                Words: []
            };
        },
        render: function() {
            if (!this.props.Current) return false;

            var btnStyle = {
                'width': '20%'
            };

            var headerStyle = {
                'backgroundColor': '#5cb85c'
            };

            var titleStyle = {
                'color': '#ffffff',
                'fontWeight': 'bold'
            };

            var cx = React.addons.classSet;

            var explanations;

            if (this.props.Current.Explanations) {
                explanations = this.props.Current.Explanations.map(function(exp, key) {
                    return (
                        <div key={'explanation' + key}>
                            <span className="badge badge-primary" onClick={this._toggleProp.bind(this, 'IsHide' + exp.Source) }>{exp.Source}</span>
                            <pre style={{ 'display': (this.props['IsHide' + exp.Source] ? 'none' : 'block') }}>{exp.Explanation}</pre>
                        </div>
                    );
                }, this);
            }

            return (
                <div>
                    <header className="bar bar-nav" style={headerStyle}>
                        <h1 className="title" style={titleStyle}>
                            {this.props.Index + 1} / {this.props.Words.length}
                        </h1>
                    </header>
                    <nav className="bar bar-tab">
                        <a className="tab-item" href="javascript: void(0)" onClick={this._move.bind(this, -1) }>
                            Prev
                        </a>
                        <a className="tab-item" href="javascript: void(0)" onClick={this._toggleProp.bind(this, 'IsShowWord') }>
                            Word
                        </a>
                        <a className="tab-item" href="javascript: void(0)" onClick={this._toggleProp.bind(this, 'IsShowImage') }>
                            Image
                        </a>
                        <a className="tab-item" href="javascript: void(0)" onClick={this._toggleProp.bind(this, 'IsShowExplain') }>
                            Explain
                        </a>
                        <a className="tab-item" href="javascript: void(0)" onClick={this._move.bind(this, 1) }>
                            Next
                        </a>
                    </nav>
                    <div className="content" style={{ 'padding': '54px 10px 60px 10px', 'lineHeight': '1.5em' }}>
                        <Avatars Current={this.props.Current} IsShowImage={this.props.IsShowImage} />
                        <Tester Current={this.props.Current} IsShowTestWord={this.props.IsShowTestWord} />
                        <div style={{ 'visibility': (this.props.IsShowWord ? 'visible' : 'hidden') }}>
                            <h2 style={{ 'textAlign': 'center' }}>
                                {this.props.Current.Word}
                            </h2>
                            <h5 style={{ 'textAlign': 'center', 'display': (this.props.IsShowSyllable ? 'block' : 'none') }}>
                                {this.props.Current.Syllable}
                                <br />
                                <br />
                                {this.props.Current.PhoneticSymbol}
                            </h5>
                            <h5 style={{ 'textAlign': 'center', 'display': (this.props.IsShowDifficultyIndex ? 'block' : 'none') }}>
                                <DifficultyIndex Current={this.props.Current} />
                            </h5>
                        </div>
                        <div style={{ 'textAlign': 'center', 'display': (this.props.IsShowSpeakBtn ? 'block' : 'none') }}>
                            <button className="btn" onClick={this._speak.bind(this, 'SSU') }>
                                SSU
                            </button>
                            {' '}
                            <button className="btn" onClick={this._speak.bind(this, 'google') }>
                                谷歌
                            </button>
                            {' '}
                            <button className="btn" onClick={this._speak.bind(this, 'usenglishfemale') }>
                                美-女
                            </button>
                            {' '}
                            <button className="btn" onClick={this._speak.bind(this, 'usenglishmale') }>
                                美-男
                            </button>
                            {' '}
                            <button className="btn" onClick={this._speak.bind(this, 'ukenglishfemale') }>
                                英-女
                            </button>
                            {' '}
                            <button className="btn" onClick={this._speak.bind(this, 'ukenglishmale') }>
                                英-男
                            </button>
                        </div>
                        <hr />
                        <div style={{ 'display': (this.props.IsShowExplain ? 'block' : 'none') }}>
                            {explanations}
                        </div>
                        <div style={{ 'display': (this.props.IsShowChartBasic ? 'block' : 'none') }}>
                            <span className="badge badge-primary">釋義常用度</span>
                            <Pi data={this.props.Current.ChartBasic} word={this.props.Current.Word} />
                        </div>
                        <div style={{ 'display': (this.props.IsChartExamples ? 'block' : 'none') }}>
                            <span className="badge badge-primary">詞性常用度</span>
                            <Pi data={this.props.Current.ChartExamples} word={this.props.Current.Word} />
                        </div>
                        <button className="btn" onClick={this._toggleProp.bind(this, 'IsShowTestWord') }>Tester</button>
                        <button className="btn" onClick={this._toggleProp.bind(this, 'IsShowSyllable') }>Syllable</button>
                        <button className="btn" onClick={this._toggleProp.bind(this, 'IsShowDifficultyIndex') }>Difficulty Index</button>
                        <button className="btn" onClick={this._toggleProp.bind(this, 'IsShowSpeakBtn') }>Speak button</button>
                        <button className="btn" onClick={this._toggleProp.bind(this, 'IsShowChartBasic') }>釋義常用度</button>
                        <button className="btn" onClick={this._toggleProp.bind(this, 'IsChartExamples') }>詞性常用度</button>
                        <button className="btn" onClick={this._archive}>{this.props.Current.Archive ? 'Unarchiver' : 'Archive'}</button>
                        <a className="btn" target="_blank" href={'http://learnersdictionary.com/definition/' + this.props.Current.Word}>learnersdictionary</a>
                        <a className="btn" target="_blank" href={'http://www.ldoceonline.com/search/?q=' + this.props.Current.Word}>ldoceonline</a>
                        <a className="btn" target="_blank" href={'https://www.vocabulary.com/dictionary/' + this.props.Current.Word}>vocabulary</a>
                        <a className="btn" target="_blank" href={'http://www.dictionary.com/browse/' + this.props.Current.Word}>dictionary</a>
                        <a className="btn" target="_blank" href={'http://www.ozdic.com/collocation-dictionary/' + this.props.Current.Word}>ozdic</a>
                        <a className="btn" target="_blank" href={'http://www.thesaurus.com/browse/' + this.props.Current.Word}>thesaurus</a>
                        <a className="btn" target="_blank" href={'http://dict.cn/big5/' + this.props.Current.Word}>dict</a>
                        <button className="btn" onClick={this._openAllLinks}>All links</button>
                        <br />
                        Pronunciation: <br />
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Pronunciation === 5 }) } onClick={this._degree.bind(this, 1, 5) }>5</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Pronunciation === 4 }) } onClick={this._degree.bind(this, 1, 4) }>4</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Pronunciation === 3 }) } onClick={this._degree.bind(this, 1, 3) }>3</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Pronunciation === 2 }) } onClick={this._degree.bind(this, 1, 2) }>2</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Pronunciation === 1 }) } onClick={this._degree.bind(this, 1, 1) }>1</button>
                        <br />
                        Spelling: <br />
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Spelling === 5 }) } onClick={this._degree.bind(this, 2, 5) }>5</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Spelling === 4 }) } onClick={this._degree.bind(this, 2, 4) }>4</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Spelling === 3 }) } onClick={this._degree.bind(this, 2, 3) }>3</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Spelling === 2 }) } onClick={this._degree.bind(this, 2, 2) }>2</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Spelling === 1 }) } onClick={this._degree.bind(this, 2, 1) }>1</button>
                        <br />
                        Meaning: <br />
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Meaning === 5 }) } onClick={this._degree.bind(this, 3, 5) }>5</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Meaning === 4 }) } onClick={this._degree.bind(this, 3, 4) }>4</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Meaning === 3 }) } onClick={this._degree.bind(this, 3, 3) }>3</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Meaning === 2 }) } onClick={this._degree.bind(this, 3, 2) }>2</button>
                        <button className={cx({ btn: true, 'btn-positive': this.props.Current.Meaning === 1 }) } onClick={this._degree.bind(this, 3, 1) }>1</button>
                    </div>
                </div>
            );
        }
    });

    var cardEntity = React.render(<Card />, document.getElementById('card'));
})();