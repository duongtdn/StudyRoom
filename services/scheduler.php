<?php

# need to investigate proper method to prevent multiple editing to scheduler json file

	# generate unique key for user
	# need some user authentication before executing below code, implement later
	$usr = 'guest';
	$class = 'Verilog1';
	$uniID = uniqid(rand(),true);
	$uniKey = $usr . $uniID;
	$token = md5($uniKey);

	
	$jsonPath = '../db/schedule.json';
	# get json file
	$jsonF = file_get_contents($jsonPath);
	$data = json_decode($jsonF,true);
	# append new class
	$schedule = array('usr'=>$usr,'class'=>$class);
	$data[$token] = $schedule;
	# update back to the server
	$newJsonStr = json_encode($data);
	file_put_contents($jsonPath,$newJsonStr)

?>