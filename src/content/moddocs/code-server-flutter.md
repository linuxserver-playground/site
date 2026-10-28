---
branch: "code-server-flutter"
---
```
flutter create myapp
cd myapp
flutter run --web-port=8989
```

Open a browser pointing to:

```
https://my-code-server-host.com/proxy/8989

or

https://8989.my-code-server-host.com
```

When editing the code, press r and refresh the web page, or install the Flutter extension for code-server or openvscode-server.
