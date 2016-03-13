var speaker = (function () {
    var audio = $('#tts').get(0);

    var speaker = {
        say: function (content, endCallback, startCallback) {
            if (startCallback) {
                startCallback();
            }

            if (content.length <= 100) {
                audioPlay(content, endCallback);
            } else {
                var splitArr = _.without(content.split(/[,|.]/g), '');

                var sentenceList = [];

                for (var i in splitArr) {
                    sentenceList.push(splitArr[i]);
                }

                loopPlay(sentenceList, 0, endCallback);
            }
        },
        stop: function () {
            audio.pause();
        }
    };

    function audioPlay(sentence, callback) {
        audio.src = '/tts?q=' + encodeURIComponent(sentence);

        audio.play();

        audio.onended = function () {
            if (callback) {
                callback();
            }
        }
    }

    function loopPlay(sentenceList, index, callback) {
        if (index <= sentenceList.length - 1) {
            audioPlay(sentenceList[index], function () {
                loopPlay(sentenceList, index + 1, callback);
            });
        } else {
            if (callback) {
                callback();
            }
        }
    }

    return speaker;
})();

(function (speaker) {
    $(function () {
        var nav = $('.well');

        $(window).scroll(function () {
            if ($(this).scrollTop() > 110) {
                nav.addClass('well-fixed');
            } else {
                nav.removeClass('well-fixed');
            }
        });

        $(window).keydown(function (e) {
            var isShift = e.keyCode === 16;

            var isCtrl = e.keyCode === 17;

            var isEsc = e.keyCode === 27;

            if (isCtrl) {
                var $focus = $('.userAnswer:focus');

                if ($focus.length > 0) {
                    var answer = $focus.data('answer');

                    speaker.say(answer);
                }
            }

            if (isEsc) {
                $('.popover').popover('hide');
            }
        });

        $(document).on('click', '.letter', function () {
            var word = $(this).attr('letter');

            speaker.say(word);
        });
    });

    angular
    .module('app',
    [
        'angularFileUpload',
        'ngSanitize',
        'ngCookies'
    ])
    .controller('ctrl',
    [
        '$scope',
        '$upload',
        '$interval',
        '$timeout',
        '$sce',
        '$cookies',
        '$filter',
        function (
            $scope,
            $upload,
            $interval,
            $timeout,
            $sce,
            $cookies,
            $filter
        ) {
            var comboAudio = $('#combo').get(0);

            var missAudio = $('#miss').get(0);

            var clearAudio = $('#clear').get(0);

            $scope.id = $cookies.id || '';

            $scope.psw = $cookies.psw || '';

            $scope.errorMessage = '';

            $scope.modalTitle = '';

            $scope.modalBody = '';

            $scope.isShowNo = false;

            $scope.isSelected = false;

            $scope.isPlay = false;

            $scope.isOpenEye = false;

            $scope.isOver = false;

            $scope.isUseCheckpoint = false;

            $scope.quizContent = '';

            $scope.list = [];

            $scope.clearCount = 0;

            $scope.clearTimer = 0;

            $scope.currentItem = undefined;

            $scope.awesome = 0;

            $scope.sucks = 0;

            var clearTimerStop;

            $scope.onKeydown = function (e, item) {
                var isF2 = e.keyCode === 113;

                var isF9 = e.keyCode === 119;

                var isF10 = e.keyCode === 130;

                var isAlt = e.keyCode === 18;

                if (isF2) {
                    item.combo = 0;

                    item.miss = 0;

                    item.progress = 0;

                    item.display = '';

                    item.userAnswer = '';
                }
            };

            $scope.start = function () {
                var contentArray = _.without($scope.quizContent.split("\n"), '');

                if (!checkQuiz(contentArray)) {
                    return false;
                }

                $scope.isOver = false;

                $interval.cancel(clearTimerStop);

                clearTimerStop = undefined;

                $scope.list = [];

                var no = 0;

                for (var i = 0; i < contentArray.length; i += 2) {
                    var quiz = contentArray[i].trim();

                    var answer = contentArray[i + 1].trim();

                    var item = {
                        no: ++no,
                        quiz: quiz,
                        answer: answer,
                        userAnswer: '',
                        display: '',
                        current: i === 0,
                        isCheckpoint: $scope.useCheckpoint && i === 0,
                        combo: 0,
                        miss: 0,
                        progress: 0,
                        eyeDisplay: $scope.isOpenEye ? answer : ''
                    };

                    $scope.list.push(item);
                }

                $scope.currentItem = $scope.list[0];

                $scope.isSelected = true;

                $scope.isPlay = true;

                $scope.clearTimer = 0;

                $scope.clearCount = 0;

                $scope.awesome = 0;

                $scope.sucks = 0;

                if (!clearTimerStop) {
                    clearTimerStop = $interval(function () {
                        $scope.clearTimer++;
                    }, 1000);
                }

                $timeout(function () {
                    $('.userAnswer')[0].focus();

                    $('[data-toggle="tooltip"]').tooltip();

                    $('.userAnswer').bind('cut copy paste', function (e) {
                        e.preventDefault();

                        alert("偷吃行為不可取ˊ_>ˋ");
                    });
                }, 200);
            };

            $scope.pause = function () {
                $interval.cancel(clearTimerStop);

                clearTimerStop = undefined;

                $scope.isPlay = false;
            };

            $scope.proceed = function () {
                if (!clearTimerStop) {
                    clearTimerStop = $interval(function () {
                        $scope.clearTimer++;
                    }, 1000);
                }

                $scope.isPlay = true;
            };

            $scope.reSelect = function () {
                $scope.isSelected = false;

                $scope.list = [];
            };

            $scope.openEye = function () {
                angular.forEach($scope.list, function (v, k) {
                    v.eyeDisplay = v.answer;
                });

                $scope.isOpenEye = true;
            };

            $scope.closeEye = function () {
                angular.forEach($scope.list, function (v, k) {
                    delete v.eyeDisplay;
                });

                $scope.isOpenEye = false;
            };

            $scope.onChange = function (item, index) {
                var currentAnser = item.answer.substr(0, item.userAnswer.length);

                item.correct = item.userAnswer === currentAnser;

                if (item.correct) {
                    item.display = currentAnser;
                }

                var currentProgress = $filter('percentage')(item.display.length / item.answer.length, 2);

                if (item.correct && currentProgress > item.progress) {
                    item.combo++;
                    comboAudio.currentTime = 0;
                    comboAudio.play();
                } else {
                    item.combo = 0;
                    item.miss++;
                    missAudio.currentTime = 0;
                    missAudio.play();
                }

                item.progress = currentProgress;

                var isFinishItem = item.correct && item.userAnswer.length === item.answer.length;

                if (isFinishItem) {
                    item.clear = true;

                    clearAudio.currentTime = 0;
                    clearAudio.play();

                    if (item.miss === 0) {
                        $scope.awesome++;
                    } else {
                        $scope.sucks++;
                    }

                    if ($scope.isUseCheckpoint && index < $scope.list.length - 1) {
                        item.isCheckpoint = false;

                        $scope.list[index + 1].isCheckpoint = true;
                    }

                    focusNext(index);

                    $scope.clearCount++;

                    var isCompleted = $scope.clearCount === $scope.list.length;

                    if (isCompleted) {
                        showMessage({
                            modalTitle: '<b>破台啦~</b>',
                            modalBody:
                                '<h1 class="text-success"><b>You\'re such a genius!!!</b></h1>' +
                                '本次歷時 ' + $scope.clearTimer + ' 秒'
                        });

                        $scope.pause();

                        $scope.isOver = true;
                    }
                }
            };

            $scope.onFileSelect = function ($files) {
                for (var i = 0; i < $files.length; i++) {
                    var file = $files[i];
                    $scope.upload = $upload.upload({
                        url: '/Api/UploadJson.ashx',
                        file: file,
                        type: '',
                    }).success(function (data) {
                        $scope.quizContent = data;
                    });
                }
            };

            $scope.tts = function (item) {
                speaker.say(item.answer);
            };

            $scope.openSave = function () {
                $scope.errorMessage = '';

                $('#saveBox').modal('show');
            };

            $scope.openLoad = function () {
                $scope.errorMessage = '';

                $scope.queryList = [];

                $('#loadBox').modal('show');
            };

            $scope.save = function () {
                if (!checkIdPsw()) {
                    return false;
                }

                if ($scope.quizContent.length === 0) {
                    $scope.errorMessage = '404 找不到吐司';

                    return false;
                }

                if (confirm('吐司將被覆蓋或新增，確定封印？')) {
                    $.ajax({
                        url: '/api/ankipan/save',
                        type: 'POST',
                        data: {
                            id: $scope.id,
                            psw: $scope.psw,
                            file: $scope.quizContent
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#saveBox').modal('hide');
                            } else {
                                $timeout(function () {
                                    $scope.errorMessage = data.error;
                                });
                            }
                        }
                    });
                }
            };

            $scope.load = function () {
                if (!checkIdPsw()) {
                    return false;
                }

                $.ajax({
                    url: '/api/ankipan/load',
                    type: 'POST',
                    data: {
                        id: $scope.id,
                        psw: $scope.psw
                    },
                    success: function (data) {
                        $timeout(function () {
                            if (data.success) {
                                $scope.quizContent = data.file;

                                $('#loadBox').modal('hide');
                            } else {
                                $scope.errorMessage = data.error;
                            }
                        });
                    }
                });
            };

            $scope.isReading = false;

            $scope.reading = function () {
                $scope.isReading = true;

                angular.forEach($scope.list, function (v, k) {
                    v.current = false;
                    v.isCheckpoint = false;
                });

                loopReading(0);
            };

            $scope.unReading = function () {
                speaker.stop();

                $scope.isReading = false;
            };

            $scope.onFocus = function (item) {
                $scope.currentItem.current = false;

                $scope.currentItem = item;

                $scope.currentItem.current = true;
            };

            $scope.useCheckpoint = function () {
                $scope.isUseCheckpoint = true;

                for (var i = 0; i < $scope.list.length; i++) {
                    $scope.list[i].isCheckpoint = false;
                }

                $scope.currentItem.isCheckpoint = true;
            };

            $scope.unUseCheckpoint = function () {
                $scope.isUseCheckpoint = false;
            };

            $scope.shuffle = function () {
                $scope.isShowNo = true;

                $scope.list = _.shuffle($scope.list);
            };

            $scope.reverse = function () {
                $scope.isShowNo = true;

                $scope.list.reverse();
            };

            $scope.reset = function () {
                $scope.isShowNo = false;

                $scope.list = _.sortBy($scope.list, function (item) {
                    return item.no;
                });
            };

            $scope.getSplitWord = function (display) {
                if (!display) {
                    return [];
                }

                var punctuation = [' ', ',', '.', '"', '!', '?'];

                var letterArr = display.split('');

                var arr = [];

                var word = '';

                for (var i in letterArr) {
                    var letter = letterArr[i];

                    var isPunctuation = _.contains(punctuation, letter);

                    if (isPunctuation) {
                        if (word.length > 0) {
                            arr.push(word);

                            word = '';
                        }

                        arr.push(letter);
                    } else {
                        word += letter;
                    }
                }

                if (word.length > 0) {
                    arr.push(word);
                }

                return arr;
            };

            $scope.swap = function () {
                var tempArr = $scope.quizContent.split(/\n/g);

                var newQuizContent = '';

                for (var i = 0; i < tempArr.length; i += 2) {
                    newQuizContent += tempArr[i + 1] + '\n';
                    newQuizContent += tempArr[i] + '\n';
                }

                $scope.quizContent = newQuizContent;
            };

            $scope.reSock = function () {
                var content = '';

                angular.forEach($scope.list, function (v, k) {
                    if (v.miss !== 0) {
                        content += v.quiz + '\n';
                        content += v.answer + '\n';
                    }
                });

                $scope.quizContent = content;

                $scope.start();
            };

            $scope.clone = function (item, index) {
                var clone = angular.copy(item);

                clone.userAnswer = '';

                clone.miss = 0;

                clone.awesome = 0;

                clone.progress = 0;

                clone.display = '';

                clone.clear = false;

                $scope.list.splice(index, 0, clone);
            };

            $scope.kill = function(index) {
                $scope.list.splice(index, 1);
            };

            function loopReading(index) {
                var item = $scope.list[index];

                var isEnd = false;

                speaker.say(
                    item.answer,
                    function () {
                        item.isCheckpoint = false;

                        item.current = false;

                        index++;

                        isEnd = index === $scope.list.length;

                        if (isEnd) {
                            $timeout(function () {
                                $scope.isReading = false;
                            });
                        }

                        if (index <= $scope.list.length - 1) {
                            loopReading(index);
                        }
                    },
                    function () {
                        if (!isEnd) {
                            item.isCheckpoint = true;

                            item.current = true;
                        }
                    }
                );
            }

            function checkIdPsw() {
                if ($scope.id.length === 0) {
                    $scope.errorMessage = '404 找不到 id';

                    return false;
                }

                if ($scope.psw.length === 0) {
                    $scope.errorMessage = '404 找不到 password';

                    return false;
                }

                $cookies.id = $scope.id;

                $cookies.psw = $scope.psw;

                return true;
            }

            function checkQuiz(contentArray) {
                if ($scope.quizContent.length === 0) {
                    showMessage({
                        modalTitle: '404 找不到吐司',
                        modalBody: '<h1 class="text-success"><b>這裡不能吃白吐司</b></h1>'
                    });

                    return false;
                }

                if (contentArray.length % 2 !== 0) {
                    showMessage({
                        modalTitle: '吐司怪怪滴',
                        modalBody: '<h1 class="text-success"><b>吐司必須是偶數行</b></h1>'
                    });

                    return false;
                }

                return true;
            }

            function focusNext(index) {
                if (index < $scope.list.length - 1) {
                    $timeout(function () {
                        var $input = $('.userAnswer').eq(index + 1);

                        $input.focus();
                    });
                }
            }

            function showMessage(data) {
                $scope.modalTitle = $sce.getTrustedHtml(data.modalTitle);

                $scope.modalBody = $sce.getTrustedHtml(data.modalBody);

                $('#messageBox').modal('show');
            }
        }
    ])
    .filter('percentage',
    [
        '$filter',
        function (
            $filter
        ) {
            return function (input, decimals) {
                return parseInt($filter('number')(input * 100, decimals), 10);
            };
        }
    ])
    .filter('letter',
    [
        function () {
            return function (input) {
                return input.replace(/[\W_]+/g, '');
            };
        }
    ])
    .directive('bsPopover', function () {
        return function (scope, element, attrs) {
            element.popover({
                placement: 'top',
                html: 'true',
                content: function () {
                    var $content = $(
                        '<a href="http://tw.dictionary.search.yahoo.com/search?p=' + attrs.letter + '" target="_blank">啞唬字典</a><br />' +
                        '<a href="https://translate.google.com.tw/?hl=zh-TW&tab=wT#en/zh-TW/' + attrs.letter + '" target="_blank">谷歌姊喘死累</a><br />' +
                        '<a href="javascript:void(0)" class="letter" letter="' + attrs.letter + '">谷歌姊嬌嗔</a>'
                    );

                    return $content;
                },
            });
        };
    });
})(speaker);