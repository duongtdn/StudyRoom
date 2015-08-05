<?php

	function writeDB($jsonPath, $key, $val) {
		
		# get json file
		$jsonF = file_get_contents($jsonPath);
		$data = json_decode($jsonF,true);
		
		# update json content
		if (array_key_exists($key, $data)) {
			foreach ($val as $k => $v) {
				$data[$key][$k] = $v;
			}
		} else {
			$data[$key] = $val;
		}
		
		# update back to the server
		$newJsonStr = json_encode($data);
		file_put_contents($jsonPath,$newJsonStr);
		
	}
	
	function getDB($jsonPath, $key) {
		# get json file
		$jsonF = file_get_contents($jsonPath);
		$data = json_decode($jsonF,true);
		
		if (array_key_exists($key, $data)) {
			return $data[$key];
		} else {
			return false;
		}
	}
	
	function registerDate() {
		return date('Y.m.d');
	}
	
	function expireDate($duration) {
		$last = '+' . $duration . ' Week';
		return date('Y.m.d', strtotime($last));
	}

?>