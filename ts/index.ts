import TemplateStore from './TemplateStore';
import TodoManager from './TodoManager';
import PopupManager from './PopupManager';
import Renderer from './Renderer';
import ConsoleManager from './ConsoleManager';
import '../sass/style'

const templateStore = new TemplateStore();
const todoManager = new TodoManager();
const popupManager = new PopupManager(templateStore);

const renderer = new Renderer(todoManager, templateStore, popupManager);
new ConsoleManager(todoManager, renderer, popupManager);
