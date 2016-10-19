(function (core) {
    var audio = $('#tts').get(0);

    var utterance = new SpeechSynthesisUtterance();

    utterance.lang = 'en-US';

    core.speaker = {
        say: function (content, endCallback, startCallback) {
            if (!content) {
                throw 'need content';
            }

            if (startCallback) {
                startCallback();
            }

            if (core.speaker.voice === 'SSU') {
                window.speechSynthesis.cancel();

                utterance.text = content;

                window.speechSynthesis.speak(utterance);

                return false;
            }

            if (content.length <= 100) {
                audioPlay(content, endCallback);
            } else {
                var sentenceList = [];

                var splitArr = content.split(/[,|.|"]/g);

                for (var i in splitArr) {
                    var item = splitArr[i];

                    if (item.trim() !== '') {
                        sentenceList.push(item);
                    }
                };

                loopPlay(sentenceList, 0, endCallback);
            }
        },
        saySpelling: function (content, endCallback, startCallback) {
            var content = content.split('').join(' ');

            core.speaker.say(content, endCallback, startCallback);
        },
        stop: function () {
            audio.pause();
        },
        voice: 'usenglishfemale'
    };

    function audioPlay(sentence, callback) {
        if (core.speaker.voice === 'google') {
            //audio.src = '/tts?q=' + encodeURIComponent(sentence);
            audio.src = 'http://translate.google.com/translate_tts?ie=utf-8&tl=en&q=' + encodeURIComponent(sentence);
        } else {
            audio.src =
            'http://api.ispeech.org/api/rest?apikey=ispeech-listenbutton-betauserkey&action=convert&format=mp3&e=audio.mp3' +
            '&voice=' + core.speaker.voice +
            '&speed=0' +
            '&text=' + encodeURIComponent(sentence);
        }

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
})(core);