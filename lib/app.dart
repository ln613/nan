//import 'dart:io';
import 'package:mobx/mobx.dart';

part 'app.g.dart';

class App = _App with _$App;

abstract class _App with Store {
  @observable
  List<String> todos = [];

  _App() {
    _init();
  }

  Future _init() async {

  }
}
