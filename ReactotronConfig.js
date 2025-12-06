import Reactotron from 'reactotron-react-native';
import {reactotronRedux} from 'reactotron-redux';

Reactotron.configure({name: 'app_name', host: 'localhost'})
  .useReactNative()
  .use(reactotronRedux()) //  <- here i am!
  .connect();

// Reactotron.use(reduxPlugin());
const yeOldeConsoleLog = console.log;

// make a new one
console.log = (...args) => {
  // always call the old one, because React Native does magic swizzling too
  yeOldeConsoleLog(...args);

  // send this off to Reactotron.
  Reactotron.display({
    name: 'CONSOLE.LOG',
    value: args,
    preview: args.length > 1 ? JSON.stringify(args) : args[0],
  });
};

export default Reactotron;
