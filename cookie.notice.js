/**
 * Cookie Notice JS - Modern Neon Version
 * @author Alessandro Benoit
 * @modernized_by Gemini
 */
(function () {

    "use strict";

    /**
     * Store current instance
     */
    var instance,
        originPaddingTop;

    /**
     * Defaults values
     * @type object
     */
    var defaults = {
        messageLocales: {
            it: 'Utilizziamo i cookie per essere sicuri che tu possa avere la migliore esperienza sul nostro sito. Se continui ad utilizzare questo sito assumiamo che tu ne sia felice.',
            en: 'We use cookies to ensure that you have the best experience on our website. If you continue to use this site we assume that you accept this.',
            fr: 'Nous utilisons des cookies afin d\'être sûr que vous pouvez avoir la meilleure expérience sur notre site. Si vous continuez à utiliser ce site, nous supposons que vous acceptez.',
            pt: 'Utilizamos cookies para garantir que você tenha a melhor experiência em nosso site. Se você continuar a usar este site, assumimos que você aceita isso.',
            es: 'Utilizamos cookies para asegurarnos de que usted tenga la mejor experiencia en nuestro sitio web. Si continúa usando este sitio, asumimos que lo acepta.',
            nl: 'We gebruiken cookies om ervoor te zorgen dat u de beste ervaring heeft op onze website. Als u deze site blijft gebruiken, gaan we ervan uit dat u dit accepteert.',
            pl: 'Używamy plików cookie w celu zapewnienia najlepszych doświadczeń na naszej stronie internetowej. Jeśli będziesz nadal korzystać z tej strony, zakładamy, że to akceptujesz.',
            de: 'Wir verwenden Cookies, um sicherzustellen, dass Sie die beste Erfahrung auf unserer Website machen können. Wenn Sie diese Website weiterhin nutzen, gehen wir davon aus, dass Sie dies akzeptieren.'
        },

        // cookieNoticePosition is now fixed to a bottom-left box, but the key is kept for compatibility
        cookieNoticePosition: 'bottom',

        learnMoreLinkEnabled: false,

        learnMoreLinkHref: '/cookie-banner-information.html',

        learnMoreLinkText: {
            it: 'Saperne di più',
            en: 'Learn more',
            fr: 'En savoir plus',
            pt: 'Saber mais',
            es: 'Aprende más.',
            nl: 'Meer informatie',
            pl: 'Dowiedz się więcej',
            de: 'Mehr erfahren'
        },

        buttonLocales: {
            en: 'OK'
        },

        expiresIn: 30,

        fontFamily: 'inherit',
        fontSize: '14px',

        // --- NEON THEME COLORS ---
        buttonBgColor: '#ff00ff',     // Neon Magenta
        buttonTextColor: '#000',     // Black for contrast
        noticeBgColor: 'rgba(26, 26, 26, 0.95)', // Dark, slightly transparent
        noticeTextColor: '#39ff14',   // Neon Green
        linkColor: '#00ffff',         // Neon Cyan
        // linkBgColor is no longer used
        linkTarget: '_blank',
        debug: false
    };
    
    /**
     * Injects the CSS animation styles into the document head
     */
    function injectAnimationStyles() {
        // Prevent injecting styles more than once
        if (document.getElementById('cookie-notice-animation-styles')) {
            return;
        }

        var style = document.createElement('style');
        style.id = 'cookie-notice-animation-styles';
        style.innerHTML = 
            '@keyframes neon-glow {' +
                '0% { box-shadow: 0 0 5px ' + defaults.noticeTextColor + ', inset 0 0 5px ' + defaults.noticeTextColor + '; }' +
                '50% { box-shadow: 0 0 20px ' + defaults.noticeTextColor + ', inset 0 0 10px ' + defaults.noticeTextColor + '; }' +
                '100% { box-shadow: 0 0 5px ' + defaults.noticeTextColor + ', inset 0 0 5px ' + defaults.noticeTextColor + '; }' +
            '}';
        document.head.appendChild(style);
    }


    /**
     * Initialize cookie notice on DOMContentLoaded
     * if not already initialized with alt params
     */
    document.addEventListener('DOMContentLoaded', function () {
        if (!instance) {
            new cookieNoticeJS();
        }
    });

    /**
     * Constructor
     * @constructor
     */
    window.cookieNoticeJS = function () {

        // If an instance is already set stop here
        if (instance !== undefined) {
            return;
        }

        // Set current instance
        instance = this;

        // If cookies are not supported or notice cookie is already set
        if (getNoticeCookie()) {
            return;
        }

        // 'data-' attribute - data-cookie-notice='{ "key": "value", ... }'
        var elemCfg = document.querySelector('script[ data-cookie-notice ]');
        var config;

        try {
            config = elemCfg ? JSON.parse(elemCfg.getAttribute('data-cookie-notice')) : {};
        } catch (ex) {
            console.error('data-cookie-notice JSON error:', elemCfg, ex);
            config = {};
        }

        // Extend default params
        var params = extendDefaults(defaults, arguments[0] || config || {});

        if (params.debug) {
            console.warn('cookie-notice:', params);
        }
        
        // Inject the animation CSS
        injectAnimationStyles();

        // Get current locale for notice text
        var noticeText = getStringForCurrentLocale(params.messageLocales);

        // Create notice
        var notice = createNotice(noticeText, params.noticeBgColor, params.noticeTextColor, params.fontFamily, params.fontSize);

        var learnMoreLink;
        var learnMoreWrapper = document.createElement('div'); // Wrapper for text and link

        notice.appendChild(learnMoreWrapper);
        learnMoreWrapper.innerHTML = noticeText + '&nbsp;';


        if (params.learnMoreLinkEnabled) {
            var learnMoreLinkText = getStringForCurrentLocale(params.learnMoreLinkText);
            learnMoreLink = createLearnMoreLink(learnMoreLinkText, params.learnMoreLinkHref, params.linkTarget, params.linkColor);
            learnMoreWrapper.appendChild(learnMoreLink);
        }
        

        // Get current locale for button text
        var buttonText = getStringForCurrentLocale(params.buttonLocales);

        // Create dismiss button
        var dismissButton = createDismissButton(buttonText, params.buttonBgColor, params.buttonTextColor, params.fontFamily);

        // Dismiss button click event
        dismissButton.addEventListener('click', function (e) {
            e.preventDefault();
            setDismissNoticeCookie(parseInt(params.expiresIn + "", 10) * 60 * 1000 * 60 * 24);
            fadeElementOut(notice);
        });

        // Append notice to the DOM
        var noticeDomElement = document.body.appendChild(notice);
        noticeDomElement.appendChild(dismissButton);

    };

    /**
     * Get the string for the current locale
     * and fallback to "en" if none provided
     * @param locales
     * @returns {*}
     */
    function getStringForCurrentLocale(locales) {
        var locale = (navigator.userLanguage || navigator.language).substr(0, 2);
        return (locales[locale]) ? locales[locale] : locales['en'];
    }

    /**
     * Test if notice cookie is there
     * @returns {boolean}
     */
    function getNoticeCookie() {
        return document.cookie.indexOf('cookie_notice') != -1;
    }

    /**
     * Create notice
     * @param message (message is no longer directly used here, but passed for compatibility)
     * @param bgColor
     * @param textColor
     * @param fontFamily
     * @param fontSize
     * @returns {HTMLElement}
     */
    function createNotice(message, bgColor, textColor, fontFamily, fontSize) {
        var notice = document.createElement('div'),
            noticeStyle = notice.style;
        
        notice.setAttribute('id', 'cookieNotice');
        notice.setAttribute('data-test-section', 'cookie-notice');
        notice.setAttribute('data-test-transitioning', 'false');

        // --- NEW STYLES for the bottom-left animated box ---
        noticeStyle.position = 'fixed';
        noticeStyle.bottom = '20px';
        noticeStyle.left = '20px';
        noticeStyle.width = '320px';
        noticeStyle.maxWidth = 'calc(100% - 40px)'; // Responsive for small screens
        noticeStyle.background = bgColor;
        noticeStyle.color = textColor;
        noticeStyle.zIndex = '9999';
        noticeStyle.padding = '20px';
        noticeStyle.textAlign = 'left';
        noticeStyle.fontSize = fontSize;
        noticeStyle.lineHeight = '1.5';
        noticeStyle.borderRadius = '10px';
        noticeStyle.border = '1px solid ' + textColor;
        noticeStyle.backdropFilter = 'blur(5px)'; // Frosted glass effect for modern browsers
        noticeStyle.webkitBackdropFilter = 'blur(5px)';
        noticeStyle.animation = 'neon-glow 3s ease-in-out infinite';

        if (!!fontFamily) {
            noticeStyle['fontFamily'] = fontFamily;
        }

        return notice;
    }

    /**
     * Create dismiss button
     * @param message
     * @param buttonColor
     * @param buttonTextColor
     * @param buttonTextFontFamily
     * @returns {HTMLElement}
     */
    function createDismissButton(message, buttonColor, buttonTextColor, buttonTextFontFamily) {
        var dismissButton = document.createElement('a'), // Changed to <a> for better styling options
            dismissButtonStyle = dismissButton.style;

        dismissButton.href = '#';
        dismissButton.innerHTML = message;
        dismissButton.setAttribute('role', 'button');
        dismissButton.className = 'confirm';
        dismissButton.setAttribute('data-test-action', 'dismiss-cookie-notice');

        // --- NEW STYLES for the button ---
        dismissButtonStyle.background = buttonColor;
        dismissButtonStyle.color = buttonTextColor;
        dismissButtonStyle.textDecoration = 'none';
        dismissButtonStyle.cursor = 'pointer';
        dismissButtonStyle.display = 'block'; // Make it a block element
        dismissButtonStyle.padding = '10px 15px';
        dismissButtonStyle.marginTop = '15px'; // Add space above the button
        dismissButtonStyle.textAlign = 'center';
        dismissButtonStyle.borderRadius = '5px';
        dismissButtonStyle.fontWeight = 'bold';
        dismissButtonStyle.transition = 'transform 0.2s ease';

        dismissButton.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
        dismissButton.onmouseout = function() { this.style.transform = 'scale(1)'; };


        if (!!buttonTextFontFamily) {
            dismissButtonStyle.fontFamily = buttonTextFontFamily;
        }

        return dismissButton;
    }

    /**
     * Create the learn more link
     * @param learnMoreLinkText
     * @param learnMoreLinkHref
     * @param linkTarget
     * @param linkColor
     * @returns {HTMLElement}
     */
    function createLearnMoreLink(learnMoreLinkText, learnMoreLinkHref, linkTarget, linkColor) {
        var learnMoreLink = document.createElement('a'),
            learnMoreLinkStyle = learnMoreLink.style;

        learnMoreLink.href = learnMoreLinkHref;
        learnMoreLink.textContent = learnMoreLinkText;
        learnMoreLink.title = learnMoreLinkText;
        learnMoreLink.target = linkTarget;
        learnMoreLink.className = 'learn-more';
        learnMoreLink.setAttribute('data-test-action', 'learn-more-link');

        // --- NEW STYLES for the link ---
        learnMoreLinkStyle.color = linkColor;
        learnMoreLinkStyle.backgroundColor = 'transparent';
        learnMoreLinkStyle.textDecoration = 'underline';
        learnMoreLinkStyle.display = 'inline-block'; // Allows margin
        learnMoreLinkStyle.marginLeft = '5px'; // Space from main text
        learnMoreLinkStyle.fontWeight = 'bold';

        return learnMoreLink;
    }

    /**
     * Set dismiss notice cookie
     * @param expireIn
     */
    function setDismissNoticeCookie(expireIn) {
        var now = new Date(),
            cookieExpire = new Date();

        cookieExpire.setTime(now.getTime() + expireIn);
        document.cookie = "cookie_notice=1; expires=" + cookieExpire.toUTCString() + "; path=/;";
    }

    /**
     * Fade a given element out
     * @param element
     */
    function fadeElementOut(element) {
        element.style.opacity = 1;
        element.setAttribute('data-test-transitioning', 'true');

        (function fade() {
            var newOpacity = (element.style.opacity -= 0.1);
            if (newOpacity < 0.01) {
                // The logic for body padding is no longer needed with the floating box design
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            } else {
                setTimeout(fade, 30); // Slightly faster fade-out
            }
        })();
    }

    /**
     * Utility method to extend defaults with user options
     * @param source
     * @param properties
     * @returns {*}
     */
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                if (typeof source[property] === 'object' && source[property] !== null && !Array.isArray(source[property])) {
                    source[property] = extendDefaults(source[property], properties[property]);
                } else {
                    source[property] = properties[property];
                }
            }
        }
        return source;
    }

    /* test-code */
    cookieNoticeJS.extendDefaults = extendDefaults;
    cookieNoticeJS.clearInstance = function () {
        instance = undefined;
    };
    /* end-test-code */

}());