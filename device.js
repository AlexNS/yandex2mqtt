class device {
  constructor(options) {
    var id = global.devices.length;
    this.data = {
      id: String(id),
      name: options.name || 'Без названия',
      description: options.description || '',
      room: options.room || '',
      type: options.type || 'devices.types.light',
      custom_data: {
        mqtt: options.mqtt || [{}]
      },
      capabilities: options.capabilities,
    }
    global.devices.push(this);
  }
  getInfo() {
    return this.data;
  };
  

  findDevIndex(arr, elem) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].type === elem) {
            return i;
        }
    }
    return false;
};



  setState(val, type, inst) {
    var int;   
    var topic; 
    switch (inst) {
      case 'on':
          try {
            if (this.data.custom_data.mqtt.useOnOff) {
              int = val ? 'ON' : 'OFF';
            } else {
              int = val ? '1' : '0';
            }
            this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.instance = inst;
            this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.value = val;
            topic = this.data.custom_data.mqtt[this.findDevIndex(this.data.custom_data.mqtt, inst)].set || false;
          } 
          catch (err) {              
            topic = false;
            console.log(err);
          }
          break;
      case 'mute':
          try {
            int = val ? '1' : '0';
            this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.instance = inst;
            this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.value = val;
            topic = this.data.custom_data.mqtt[this.findDevIndex(this.data.custom_data.mqtt, inst)].set || false;
          } 
          catch (err) {              
            topic = false;
            console.log(err);
          }
          break;
      case 'brightness':
            try {
              const maxRange = this.data.custom_data.mqtt[this.findDevIndex(this.data.custom_data.mqtt, inst)].maxRange;
              if (maxRange) {
                int = (val * maxRange / 100) | 0;
              } else {
                int = val;
              }
              int = JSON.stringify(int);
              this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.instance = inst;
              this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.value = val;
              topic = this.data.custom_data.mqtt[this.findDevIndex(this.data.custom_data.mqtt, inst)].set || false;
            } 
            catch (err) {              
              topic = false;
              console.log(err);
            }
            break;          
      default:
          try {
            int = JSON.stringify(val);
            this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.instance = inst;
            this.data.capabilities[this.findDevIndex(this.data.capabilities, type)].state.value = val;
            topic = this.data.custom_data.mqtt[this.findDevIndex(this.data.custom_data.mqtt, inst)].set || false; 
          } 
          catch (err) {              
            topic = false;
            console.log(err);
          }  
    };

    if (topic) {
      this.client.publish(topic, int);
    }
    return [
      {
      	'type': type,
        'state': {
          'instance': inst,
          'action_result': {
            'status': 'DONE'
          }
        }
      }
    ];
  };
}
module.exports = device;
