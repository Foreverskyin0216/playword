/**
 * The custom style sheet to apply to the observer UI.
 */
export const observerCSS = `
  #plwd-panel {
    background: rgba(0, 0, 0, .7);
    height: 100%;
    opacity: 0;
    transition: all .3s;
    visibility: hidden;
    width: 100%;
  }

  #plwd-banner {
    color: #ffffff;
    font-size: 2em;
    font-weight: bold;
    left: 4vw;
    position: absolute;
    top: 6vh;
  }

  #plwd-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid #ffffff;
    color: #ffffff;
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 2px;
    padding: 12px;
    width: 90%;
  }

  #plwd-input[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  #plwd-input-box {
    margin: 10% auto 0 auto;
    width: 90%;
  }

  #plwd-timeline {
    max-height: 55vh;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    width: 100%;
  }

  #plwd-preview {
    margin: auto;
    width: 80%;
    text-align: left;
  }

  #plwd-preview-title {
    color: #ffffff;
    display: inline-block;
    float: left;
    font-size: 2em;
    font-weight: bold;
    height: 40px;
    line-height: 40px;
    margin: 0;
    visibility: hidden;
  }

  #plwd-panel {
    display: block;
    left: 0;
    position: fixed;
    text-align: center;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2147483647;
  }

  #plwd-toast {
    background: #333333;
    border-radius: 25px;
    bottom: 30px;
    font-size: 1.5em;
    font-weight: bold;
    height: 50px;
    left: 0;
    line-height: 50px;
    margin: auto;
    position: fixed;
    right: 0;
    text-align: center;
    visibility: hidden;
    width: 50px;
    z-index: 2147483647;
  }

  #plwd-toast-icon {
    float: left;
    width: 50px;
  }

  #plwd-toast-content {
    overflow: hidden;
    white-space: nowrap;
  }

  #plwd-toast.open {
    animation: fade-in 0.5s, expand 0.5s 0.5s, stay 0.5s 1s, fade-out 0.5s 1.5s;
    visibility: visible;
  }

  #plwd-input:focus {
    outline: none;
  }

  #plwd-input::placeholder {
    color: #ffffff;
    font-size: 20px;
    opacity: 0.4;
    padding: 12px;
  }

  #plwd-loader-box {
    display: inline-block;
    height: 20px;
    width: 20px;
  }

  #plwd-accept-btn {
    border-radius: 25px;
    color: #4db6ac;
    font-size: 1.5em;
    height: 50px;
    line-height: 50px;
    margin: 8px;
    width: 150px;
  }

  #plwd-drop-btn {
    border-radius: 25px;
    color: #e0e0e0;
    font-size: 1.5em;
    height: 50px;
    line-height: 50px;
    margin: 8px;
    width: 150px;
  }

  #plwd-dry-run-btn {
    border-radius: 25px;
    color: #e5c07b;
    float: right;
    font-size: 1.2em;
    height: 40px;
    line-height: 40px;
    width: 100px;
    visibility: hidden;
  }

  #plwd-clear-btn {
    border-radius: 25px;
    color: #e0e0e0;
    float: right;
    font-size: 1.2em;
    height: 40px;
    line-height: 40px;
    width: 100px;
    visibility: hidden;
  }

  #plwd-accept-btn, #plwd-drop-btn, #plwd-dry-run-btn, #plwd-clear-btn {
    background: transparent;
    border: none;
    box-sizing: border-box;
    cursor: pointer;
    font-weight: bold;
    outline: none;
    overflow: hidden;
    position: relative;
    text-align: center;
    vertical-align: middle;
  }

  #plwd-accept-btn::before, #plwd-drop-btn::before, #plwd-dry-run-btn::before, #plwd-clear-btn::before {
    background: currentColor;
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: opacity .3s;
  }

  #plwd-accept-btn::after, #plwd-drop-btn::after, #plwd-dry-run-btn::after, #plwd-clear-btn::after {
    background: currentColor;
    border-radius: 25px;
    content: '';
    height: 6vh;
    left: 50%;
    opacity: 0;
    padding: 50%;
    position: absolute;
    transform: translate(-50%, -50%) scale(1);
    transition: opacity 1s, transform .5s;
  }

  #plwd-accept-btn:hover::before,
  #plwd-drop-btn:hover::before,
  #plwd-dry-run-btn:hover::before,
  #plwd-clear-btn:hover::before {
    opacity: .1;
  }

  #plwd-accept-btn:active::after,
  #plwd-drop-btn:active::after,
  #plwd-dry-run-btn:active::after,
  #plwd-clear-btn:active::after {
    opacity: .2;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0s;
  }

  #plwd-panel.open, #plwd-preview-title.open, #plwd-dry-run-btn.open, #plwd-clear-btn.open {
    opacity: 1;
    visibility: visible;
  }

  #plwd-loader {
    animation: loading .75s infinite linear;
    border-bottom: 4px solid rgba(255, 255, 255, .5);
    border-left: 4px solid rgba(255, 255, 255, .5);
    border-right: 4px solid rgba(255, 255, 255, .5);
    border-top: 4px solid rgba(255, 255, 255, 1);
    border-radius: 100%;
    height: inherit;
    width: inherit;
  }

  .plwd-marker {
    font-size: 1em;
    font-weight: bold;
    padding: 0 16px;
  }

  .plwd-timeline-item {
    animation: draw-border 1s;
    color: #ffffff;
    content-visibility: auto;
    border-color: #26a69a;
    border-style: solid;
    border-width: 2px;
    border-right-width: 0px;
    border-top-width: 0px;
    font-size: 1.5em;
    height: 100px;
    line-height: 100px;
    list-style-type: none;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 16px;
    position: relative;
    text-align: left;
    white-space: nowrap;
    width: 100%;
  }

  .plwd-timeline-item:last-child {
    border-bottom: none;
  }

  @keyframes expand {
    from {
      min-width: 50px;
    }
    to {
      min-width: 250px;
    }
  }

  @keyframes fade-in {
    from {
      bottom: 0;
      opacity: 0;
    }
    to {
      bottom: 30px;
      opacity: 1;
    }
  }

  @keyframes stay {
    from {
      min-width: 250px;
    }
    to {
      min-width: 250px;
    }
  }

  @keyframes fade-out {
    from {
      bottom: 30px;
      min-width: 250px;
      opacity: 1;
    }
    to {
      bottom: 45px;
      min-width: 250px;
      opacity: 0;
    }
  }

  @keyframes draw-border {
    0% {
      max-height: 0;
      width: 0;
    }
    30% {
      max-height: 100px;
      width: 0;
    }
    100% {
      max-height: 100px;
      width: 100%;
    }
  }

  @keyframes loading {
	  from {
      transform: rotate(0deg);
    }
	  to {
      transform: rotate(359deg);
    }
  }
`
