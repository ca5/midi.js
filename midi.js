MIDI = {}
MIDI.midi = null;
MIDI.outputSelect = null;
MIDI.outputList = null;
MIDI.selectId = "outputPort";

MIDI.logger = function(msg){
    console.log("[midi.js] " + msg);
}

MIDI.init = function(selectId){
    if(selectId){
        MIDI.selectId = selectId;
    }
    MIDI.logger("init: " + MIDI.selectId);
    try{
        if(navigator.requestMIDIAccess){
            navigator.requestMIDIAccess({sysex:false}).then(
                MIDI.onSuccess, MIDI.onFailure
                );
        }
        else{
            MIDI.logger("cannot use Web MIDI API");
        }
    }
    catch(e){
        MIDI.logger("cannot use Web MIDI API");
    }
}

MIDI.onSuccess = function(midiAccess){
	MIDI.logger("MIDI ready!");
	MIDI.midi = midiAccess;
	var outputCmb = document.getElementById(MIDI.selectId);
    outputCmb.size = 1;
    outputCmb.onchange = function(){
        MIDI.changeOutput();
    }
	var outLength = MIDI.midi.outputs().length;
    outputCmb.appendChild(new Option("OFF", "off"));
	MIDI.outputList = MIDI.midi.outputs();
	for(var i = 0; i < outLength; i++){
		var output = MIDI.midi.outputs()[i];
		outputCmb.appendChild(new Option(output.manufacturer + " " + output.name, output.id));
	}
	MIDI.changeOutput();
}

MIDI.onFailure = function(msg){
	MIDI.logger("Failed to get MIDI access - " + msg);
}

MIDI.changeOutput = function(){
    MIDI.logger("changeOutput")
	var outputCmb = document.getElementById(MIDI.selectId);
	var selectIndex = outputCmb.selectedIndex;
	var outLength = MIDI.outputList.length;

    MIDI.outputSelect = null;
	for(var i = 0; i < outLength; i++){
		var output = MIDI.outputList[i];
		if(outputCmb.options[selectIndex].value == output.id){
			MIDI.outputSelect = output;
			break;
		}
	}
}

MIDI.outputMessage = function(data0, data1, data2){
	if(MIDI.outputSelect) {
		try{
			var data = [data0, data1, data2];
			MIDI.outputSelect.send(data);
			MIDI.logger("MIDI OUT : " + data0
				+ " " + data1
				+ " " + data2);
		}
        catch(e){
			MIDI.logger(e);
		}
	}
}

MIDI.noteOn = function(channel, noteNum, verocity){
    MIDI.outputMessage(0x90 + channel, noteNum, verocity);
}

MIDI.noteOff = function(channel, noteNum, verocity){
    MIDI.outputMessage(0x80 + channel, noteNum, verocity);
}
