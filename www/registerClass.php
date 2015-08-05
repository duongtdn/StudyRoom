<?php

	require "Util.php";

	$tcScheduler = '../db/tc.schedule.json';
	$classScheduler = '../db/class.schedule.json';
	$userSchedule = '../db/user.schedule.json';
	$classDB = '../db/classdb.json';

	# generate unique key for user
	# need some user authentication before executing below code, implement later
	
	if (isset($_POST['uid']) && isset($_POST['cid'])) {
		
		$uid = $_POST['uid'];
		$cid = $_POST['cid'];
		
		# generate unique token
		$uniID = uniqid(rand(),true);
		$uniKey = $uid . $uniID . $cid;
		$token = md5($uniKey);
		
		# get class path from cid
		$curi = '';
		$class = getDB($classDB,$cid);
		if ($class === false) {
			# handle logic for should redirect to an error page indicating page not found
			exit ('Error 404: Page not found');
		} else {
			$curi = $class['uri'];
		}
		
		# calculate end date based on class information
		$start = registerDate();
		$end = expireDate($class['duration']);
		
		# update user registration to database
		
		# to tc.scheduler		
		$schedule = array('uid'=>$uid, 'class'=>$curi, 'end'=>$end);		
		writeDB($tcScheduler,$token,$schedule);
		
		# to class.schedule
		$schedule = array('start'=>$start, 'end'=>$end);
		$reg = array($uid=>$schedule);		
		writeDB($classScheduler,$cid,$reg);
		
		# to user.scheduler	
		$schedule = array('start'=>$start, 'end'=>$end);
		$reg = array($cid=>$schedule);
		writeDB($userSchedule,$uid,$reg);
		
		# to class.scheduler
		
		echo 'Success : Updated the registration to scheduler';
	}
	

?>