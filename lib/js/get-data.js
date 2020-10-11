//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

// helper function to get both systolic and diastolic bp
function getBloodPressureValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function(observation) {
    var BP = observation.component.find(function(component) {
      return component.code.coding.find(function(coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });

  return formattedBPObservations[0];
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    sys: {
      value: ''
    },
    dia: {
      value: ''
    },
	glucode: {
	  value: ''
	}, 
	fastp: {
	  value: ''
	}, 
	a1c: {
	  value: ''
	}, 
	hdl: {
	  value: ''
	}, 
	ldl: {
	  value: ''
	}, 
	triglycerides: {
	  value: ''
	}, 
	cholesterol: {
	  value: ''
	}, 
  };
}

//helper function to display the annotation on the index page
function displayAnnotation(annotation) {
  note.innerHTML = annotation;
}

//function to display the observation values you will need to update this
function displayObservation(obs) {
	 
  sys.innerHTML = obs.sys;
  dia.innerHTML = obs.dia;
  glucose.innerHTML = obs.glucose;
  a1c.innerHTML = obs.a1c;
  fastp.innerHTML = obs.fastp;
  hdl.innerHTML = obs.hdl;
  ldl.innerHTML = obs.ldl;
  cholesterol.innerHTML = obs.cholesterol;
  tri.innerHTML = obs.triglycerides;
}

//once fhir client is authorized then the following functions can be executed
FHIR.oauth2.ready().then(function(client) {

  // get observation resoruce values
// you will need to update the below to retrive the weight and height values
var query = new URLSearchParams();

query.set("patient", client.patient.id);
query.set("_count", 100);
query.set("_sort", "-date");
query.set("code", [
  'http://loinc.org|8462-4',
  'http://loinc.org|8480-6',
  'http://loinc.org|4548-4',
  'http://loinc.org|LA28695-7',
  'http://loinc.org|2339-0',
  'http://loinc.org|2093-3',
  'http://loinc.org|2571-8',
  'http://loinc.org|2085-9',
  'http://loinc.org|2089-1',
  'http://loinc.org|18262-6',
  'http://loinc.org|55284-4',
  
  
  
].join(","));



client.request("Observation?" + query, {
  pageLimit: 0,
  flat: true
}).then(
  function(ob) {

    // group all of the observation resoruces by type into their own
    var byCodes = client.byCodes(ob, 'code');
	
	var triglyp = byCodes('2571-8');	
	
	
	var a1cp = byCodes('4548-4');
	var cholesterolp = byCodes('2093-3');
	var glucosep = byCodes('2339-0');
	var fastp = byCodes('LA28695-7');
    var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
    var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
    var hdl = byCodes('2085-9');
    var ldl = byCodes('2089-1');
	
	var ldl2 = byCodes('18262-6');
	
    // create patient object
    var p = defaultPatient();

    // set patient value parameters to the data pulled from the observation resoruce
	
	
	p.hdl = getQuantityValueAndUnit(hdl[0]);
    p.ldl = getQuantityValueAndUnit(ldl[0]);
	p.glucose = getQuantityValueAndUnit(glucosep[0]);
	p.a1c = getQuantityValueAndUnit(a1cp[0]);
	p.triglycerides = getQuantityValueAndUnit(triglyp[0]);
	p.cholesterol = getQuantityValueAndUnit(cholesterolp[0]);
	p.sys = getQuantityValueAndUnit(systolicbp);
	p.dia = getQuantityValueAndUnit(diastolicbp);
	
	
	if(p.ldl == undefined){
		p.ldl = getQuantityValueAndUnit(ldl2[0]);
	}
	
	
	//SYS
    if (systolicbp != undefined) 
	{
	  
	  sysColor = Number(parseFloat((systolicbp)).toFixed(2))
      
	  
	  if(sysColor < 120)
	  {
		  document.getElementById("sys").style.color = 'green'
	  }
	  else if(sysColor <= 129)
	  {
		  document.getElementById("sys").style.color = 'yellow'
	  }
	  else 
	  {
		  document.getElementById("sys").style.color = 'red'
	  }
	  
    } 
	else 
	{
      p.sys = 'undefined'
	  
	  document.getElementById("sys").style.color = 'gray'
    }

	//Dia
    if (diastolicbp != undefined) 
	{
	  diaColor = Number(parseFloat((diastolicbp)).toFixed(2))
	  
	  if(diaColor < 80)
	  {
		  document.getElementById("dia").style.color = 'green'
	  }
	  else if(diaColor <= 89)
	  {
		  document.getElementById("dia").style.color = 'yellow'
	  }
	  else 
	  {
		  document.getElementById("dia").style.color = 'red'
	  }
    } 
	else 
	{
	  document.getElementById("dia").style.color = 'gray'
      p.dia = 'undefined'
    }
	
	//Fasting
	if(fastp[0] != undefined) 
	{
		p.fastp = fastp[0].valueString;
		if(p.fastp == 'Positive')
		{
			document.getElementById("fastp").style.color = 'red'
		}
		else 
		{
			document.getElementById("fastp").style.color = 'green'
		}

	} 
	else 
	{
		document.getElementById("fastp").style.color = 'gray'
		p.fastp = 'undefined'
	}
	
	//Glucose
	if(p.glucose != undefined) 
	{
		gluColor = Number(parseFloat((glucosep[0].valueQuantity.value)).toFixed(2))
		
		if(gluColor <= 100) 
		{ 
			document.getElementById("glucose").style.color = 'green'
		}
		else if(gluColor <= 125) 
		{
			document.getElementById("glucose").style.color = 'yellow'
		}
		else
		{
			document.getElementById("glucose").style.color = 'red'
		}
		//Range Checker
		
	} 
	else 
	{
		document.getElementById("glucose").style.color = 'gray'
		p.glucose = 'undefined'
	}
	
	//A1C 
	if(p.a1c != undefined) 
	{	
		a1cColor = Number(parseFloat((a1cp[0].valueQuantity.value)).toFixed(2))
		//Range Checker
		
		if(a1cColor <= 5.7)
		{
			//green
			document.getElementById("a1c").style.color = 'green'
		}
		else if(a1cColor <= 6.4)
		{
			//yellow
			document.getElementById("a1c").style.color = 'yellow'
		}
		else 
		{
			//red
			document.getElementById("a1c").style.color = 'red'
		}
		
	} 
	else 
	{
		document.getElementById("a1c").style.color = 'gray'
		p.a1c = 'undefined'
	}

	//Triglycerides
	if(p.triglycerides != undefined) 
	{
		triColor = Number(parseFloat((triglyp[0].valueQuantity.value)).toFixed(2))
		
		if(triColor <= 100) 
		{
		document.getElementById("tri").style.color = 'green'
		} 
		else if(triColor <= 199 && triColor > 100)
		{
			document.getElementById("tri").style.color = 'yellow'
		}
		else 
		{
			document.getElementById("tri").style.color = 'red'
		}
	}
	else 
	{
		document.getElementById("tri").style.color = 'gray'
	}
		
	//Cholesterol Parse
	if(p.cholesterol != undefined) {
		cholColor = Number(parseFloat((cholesterolp[0].valueQuantity.value)).toFixed(2))
		if(cholColor < 200) 
		{
			document.getElementById("cholesterol").style.color = 'green'
		} 
		else if(cholColor >= 200 && cholColor < 240) 
		{
			document.getElementById("cholesterol").style.color = 'yellow'
		}
		else 
		{
			document.getElementById("cholesterol").style.color = 'red'
		}
	} 
	else 
	{
		document.getElementById("cholesterol").style.color = 'gray'
	}
	
	//Hdl Parse
	if(p.hdl != undefined) 
	{
		hdlColor = Number(parseFloat((hdl[0].valueQuantity.value)).toFixed(2))
		if(hdlColor <= 60 && hdlColor >= 40) 
		{
			document.getElementById("hdl").style.color = 'green'
		} 
		else
		{
			document.getElementById("hdl").style.color = 'red'
		}
	} 
	else 
	{
		document.getElementById("hdl").style.color = 'gray'
	}
	
	//Ldl Parse
	if(p.ldl != undefined) 
	{
		if(ldl[0] == undefined)
		{
			ldlColor = Number(parseFloat((ldl2[0].valueQuantity.value)).toFixed(2))
		} else 
		{
			ldlColor = Number(parseFloat((ldl[0].valueQuantity.value)).toFixed(2))
		}
		
		if(ldlColor <= 100) 
		{
			document.getElementById("ldl").style.color = 'green'
		} 
		else
		{
			document.getElementById("ldl").style.color = 'red'
		}
	} 
	else 
	{
		document.getElementById("ldl").style.color = 'gray'
	}
		
	displayObservation(p)
	
	
  });

}).catch(console.error);
