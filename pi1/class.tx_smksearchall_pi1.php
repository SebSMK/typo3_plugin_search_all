<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2013 S.Brossard <sebastien.brossard@smk.dk>
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/
/**
 * [CLASS/FUNCTION INDEX of SCRIPT]
 *
 * Hint: use extdeveval to insert/update function index above.
 */

require_once(PATH_tslib.'class.tslib_pibase.php');


/**
 * Plugin 'SMKs search in collection and site' for the 'smk_search_all' extension.
 *
 * @author	S.Brossard <sebastien.brossard@smk.dk>
 * @package	TYPO3
 * @subpackage	tx_smksearchall
 */
class tx_smksearchall_pi1 extends tslib_pibase {
	var $prefixId      = 'tx_smksearchall_pi1';		// Same as class name
	var $scriptRelPath = 'pi1/class.tx_smksearchall_pi1.php';	// Path to this script relative to the extension dir.
	var $extKey        = 'smk_search_all';	// The extension key.
	
	/**
	 * The main method of the PlugIn
	 *
	 * @param	string		$content: The PlugIn content
	 * @param	array		$conf: The PlugIn configuration
	 * @return	The content that is displayed on the website
	 */
	function main($content, $conf) {
		$this->conf = $conf;
		$this->pi_setPiVarDefaults();
		$this->pi_loadLL();
		$this->pi_USER_INT_obj = 1;	// Configuring so caching is not expected. This value means that no cHash params are ever set. We do this, because it's a USER_INT object!
	
// 		// JS
//  		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_jquery_172'] = '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_jquery_1824'] = '<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/jquery-ui.min.js" type="text/javascript"></script>';
		
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_js_login'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/login.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_js_basic']  = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/manager.init.js" type="text/javascript"></script>';
		
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_core'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/Core.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_abstract'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/AbstractManager.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_manager_jquery'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/managers/Manager.jquery.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_Parameter'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/Parameter.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_ParameterStore'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/ParameterStore.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_AbstractWidget'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/AbstractWidget.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_widget_result'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/widgets/ResultWidget.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_js_pager'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/jquery/PagerWidget.js" type="text/javascript"></script>';
		
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_AbstractFacetWidget'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/AbstractFacetWidget.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_widget_tagcloud'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/widgets/TagcloudWidget.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_widget_current_search'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/widgets/CurrentSearchWidget.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_switch'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/ViewSwitch.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_core_AbstractTextWidget'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/core/AbstractTextWidget.js" type="text/javascript"></script>';
		
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_widget_autocomplete'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/widgets/AutocompleteWidget.js" type="text/javascript"></script>';		
		
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_jquery_fancy_box'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/jqueryfancybox/source/jquery.fancybox.js" type="text/javascript"></script>';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_jquery_fancy_start'] = '<script src="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/fancy.js" type="text/javascript"></script>';
		

		
// 		// CSS
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_css_fancy'] = '<link rel="stylesheet" type="text/css" href="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/js/jqueryfancybox/source/jquery.fancybox.css?v=2.1.5" media="screen" />';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_css_jquery'] = '<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.24/themes/smoothness/jquery-ui.css" media="screen" />';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_css_soeg'] = '<link rel="stylesheet" type="text/css" href="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/css/soeg.css" media="screen" />';
		
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_css_art'] = '<link rel="stylesheet" type="text/css" href="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/css/art-and-artists.css" media="screen" />';
// 		$GLOBALS['TSFE']->additionalHeaderData['smk_soeg_collection_css_switch'] = '<link rel="stylesheet" type="text/css" href="'.t3lib_extMgm::siteRelPath($this->extKey).'pi1/css/switch.css" media="screen" />';

		
		//* get search string in POST
		$sword =  htmlspecialchars($this->piVars['sword']);
		
		$dir_base = dirname($_SERVER['PHP_SELF']) == '/' ? "" :  dirname($_SERVER['PHP_SELF']);
		$dir_base .= t3lib_extMgm::siteRelPath('smk_search_all');				
		
		$sysconf = (array)unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf'][$this->extKey]);
		$solr_path = (string)$sysconf['SolrPath'];
		
		$content=sprintf('	<script>
				
						var smkSearchAllConf = {
								solrPath: "%s",
								pluginDir: "%s",
								serverName: "%s",
								currentLanguage: "%s",
								searchStringPOST: "%s"		
							}
						
					</script>
					<div id="smk_search_wrapper"></div>',
					$solr_path,
					$dir_base,
					$_SERVER['SERVER_NAME'],
					$this->pi_getLL('language'),
					$sword
					
					);
	
		return $this->pi_wrapInBaseClass($content);
	}
}



if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/smk_search_all/pi1/class.tx_smksearchall_pi1.php'])	{
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/smk_search_all/pi1/class.tx_smksearchall_pi1.php']);
}

?>