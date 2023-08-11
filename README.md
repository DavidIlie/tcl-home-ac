# Reverse Engineering TCLHome App for API Access

[![YouTube Video](https://img.youtube.com/vi/A8ICsEnGfkg/0.jpg)](https://www.youtube.com/watch?v=A8ICsEnGfkg)

This repository contains a solution for accessing the API of the TCLHome mobile application through reverse engineering techniques. The TCLHome app provides control over TCL air conditioners and related devices, but the API is not publicly documented. By reverse engineering the app's communication with the server, I was able to gain insight into the API structure and develop a method to interact with it programmatically.

[See blog post](https://davidilie.com)

## Background

The TCLHome app operates by authenticating users with a email and password, generating an access token, and subsequently obtaining a "Saas Token" for further authentication through a refresh token endpoint. The challenge arose when trying to use the obtained token to make requests to the API. A checksum calculation was involved, preventing direct usage of the token for requests.

## What I want to achieve in the future:

-  [ ] Make this a proper home assistant integration
-  [ ] it uses some more attributes from a previous request I made to authenticate itself to AWS and then to an MQTT server which I can’t snoop because it detects a proxy, so this is way out of my league. FIND A WAY TO DO IT!

## Basic Solution Overview

-  **Emulator and Man-In-The-Middle (MITM) Proxy**: We utilized an emulator to run the TCLHome app and intercepted its communication using a MITM proxy. This proxy intercepts requests between the client (app) and the server, revealing the details of requests made from the app.
-  **APK Decompilation**: The APK file of the TCLHome app was decompiled using [Vineflower](https://github.com/Vineflower/vineflower), which partially converted the Smali code to Java. While the decompiled code was limited, it provided valuable insights into the inner workings of the app.
-  **Smali to Java Conversion with ChatGPT**: I used ChatGPT to assist in converting Smali code into Java. This allowed me to understand the function responsible for generating the hash token required for API requests.
-  **Code Conversion to Typescript**: The extracted Java code was then converted to TypeScript to align with the API server which hopefully I will rewrite to a pure Home Assistant integration one day
-  **API Interaction**: We implemented functions to generate the required tokens, calculate the hash, and make authenticated requests to the TCLHome API. The result was successful retrieval of data, including the live power state of TCL air conditioners.

## Disclaimer

This repository is meant for educational and research purposes only. Reverse engineering and intercepting app communication may raise legal and ethical considerations. Ensure you have the necessary permissions before using these techniques.

## Contributing

Contributions to enhance the code, documentation, or address potential issues are welcome. Please create a pull request with a detailed description of your changes.
