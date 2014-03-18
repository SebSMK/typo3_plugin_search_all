<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>


	
<?php

// echo sprintf('<meta content=" http://%s%s" property="og:url">',$_SERVER[HTTP_HOST], $_SERVER[REQUEST_URI]);

// if(isset($_GET['title'])) {
// 	echo sprintf('<meta content="%s" property="og:title">', $_GET['title']);
// }
// if(isset($_GET['description'])) {
// 	echo sprintf('<meta content="%s" property="og:description">', $_GET['description']);
// }
// if(isset($_GET['image'])) {
// 	echo sprintf('<meta content="%s" property="og:image">', $_GET['image']);
// }


echo '
<meta content="' . 'Search SMK\'s collection on' . '" property="og:title"/>
<meta content="' . 'http://www.smk.dk/udforsk-kunsten/soeg-i-smk/' . '" property="og:description"/>
<meta content="' . $_GET["image"] . '" property="og:image"/>'

?>
		
	</head>
	
	<body></body>
</html>
