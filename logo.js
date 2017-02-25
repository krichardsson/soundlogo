var logo = {
    src: [
        [-1, -0.73],
        [-1, 1],
        [1, 1],
        [1, -1],
        [-0.73, -1],
        [-0.3, -0.58],
        [0, -0.64],
        [0.47, -0.47],
        [0.64, 0],
        [0.47, 0.47],
        [0, 0.64],
        [-0.47, 0.47],
        [-0.64, 0],
        [-0.58, -0.30],
    ],

    plotStep: 1,

    synthesizeCycle: function(fs, freq) {
        var s = []

        var sampleCount = fs / freq;
        var segmentLen = sampleCount / logo.src.length;
        for (var i = 0; i < sampleCount; i++) {
            var smplInSegment = i % segmentLen;
            var segment = Math.floor(i / segmentLen);
            var sgementPos = smplInSegment / segmentLen;

            var nextSegment = segment + 1;
            if (nextSegment >= logo.src.length) {
                nextSegment = 0;
            }

            var samples = this.renderSample(logo.src[segment], logo.src[nextSegment], sgementPos);
            s[i] = samples;
        }

        return s;
    },

    renderSample: function(p0, p1, pos) {
        var l = p0[0] * (1 - pos) + p1[0] * pos;
        var r = p0[1] * (1 - pos) + p1[1] * pos;
        return [l, r];
    },

    synthesize: function(cycle, sound) {
        var l = sound.getChannelData(0);
        var r = sound.getChannelData(1);
        var soundLen = l.length;
        var cycleLen = cycle.length;

        var s = 0
        for (i = 0; i < soundLen; i++) {
            l[i] = cycle[s][0];
            r[i] = cycle[s][1];

            s++;
            if (s >= cycleLen) {
                s = 0;
            }
        }

    },

    play: function(context, sound) {
        var source = context.createBufferSource();
        source.buffer = sound;
        source.connect(context.destination);
        source.start();
    },

    drawxy: function(context, cycle) {
        var w = context.canvas.width;
        var h = context.canvas.height;
        var scale = Math.min(w / 2.5, h / 2.5);

        context.save();
        context.translate(w / 2, h / 2);
        context.scale(scale, -scale);
        context.lineWidth = scale / 5000;

        context.moveTo(cycle[0][0], cycle[0][1]);
        for (i = 0; i < cycle.length; i += logo.plotStep) {
            context.lineTo(cycle[i][0], cycle[i][1]);
        }
        context.lineTo(cycle[0][0], cycle[0][1]);

        context.stroke();
        context.restore();
    },

    drawOneChannel: function(context, cycle, channel) {
        var w = context.canvas.width;
        var h = context.canvas.height;

        context.save();
        context.translate(0, h / 2);
        context.scale(w / cycle.length, -h / 2.5);
        context.lineWidth = h / 5000;

        context.moveTo(0, cycle[0][channel]);
        for (i = 0; i < cycle.length; i += logo.plotStep) {
            context.lineTo(i + 1, cycle[i][channel]);
        }

        context.stroke();
        context.restore();
    },

};

var context = new window.AudioContext();
var freq = 400;
var sampleCount = context.sampleRate * 2.0;
var sound = context.createBuffer(2, sampleCount, context.sampleRate);

cycle = logo.synthesizeCycle(context.sampleRate, freq);

logo.drawxy(document.getElementById("graphxy").getContext("2d"), cycle);
logo.drawOneChannel(document.getElementById("graphx").getContext("2d"), cycle, 0);
logo.drawOneChannel(document.getElementById("graphy").getContext("2d"), cycle, 1);

logo.synthesize(cycle, sound);

var button = document.getElementById('play');
button.onclick = function() {
    logo.play(context, sound);
}