import { DeviceInfo } from '../types';

/**
 * Detect client device, operating system, and browser info
 * for cross-device telemetry and real-time admin monitoring.
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      device_type: 'Laptop / Desktop',
      browser: 'Web Browser',
      os: 'Unknown OS',
      summary: 'Web Browser (Unknown OS)'
    };
  }

  const ua = navigator.userAgent || '';
  
  // 1. Device Type
  let deviceType: DeviceInfo['device_type'] = 'Laptop / Desktop';
  const isMobileUa = /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUa = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
  const isTouch = navigator.maxTouchPoints > 1;
  const isSmallScreen = window.innerWidth <= 768;

  if (isTabletUa || (isTouch && window.innerWidth >= 600 && window.innerWidth <= 1024)) {
    deviceType = 'Tablet';
  } else if (isMobileUa || (isTouch && isSmallScreen)) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Laptop / Desktop';
  }

  // 2. Operating System
  let os = 'Unknown OS';
  if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
  }

  // 3. Browser
  let browser = 'Web Browser';
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua) && !/OPR\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua) && !/CriOS/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/CriOS/i.test(ua)) {
    browser = 'Chrome on iOS';
  } else if (/FxiOS/i.test(ua)) {
    browser = 'Firefox on iOS';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  }

  const icon = deviceType === 'Mobile' ? '📱' : deviceType === 'Tablet' ? '📟' : '💻';
  const summary = `${icon} ${browser} (${os})`;

  return {
    device_type: deviceType,
    browser,
    os,
    summary,
    user_agent: ua.slice(0, 150),
    screen_resolution: `${window.screen.width}x${window.screen.height}`
  };
}
