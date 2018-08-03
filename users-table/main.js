(function () {
	'use strict';

	class AbstractModel {

		get urlRead() {
			throw new Error('This is abstract method');
		}

		get urlReadOptions() {
			throw new Error('This is abstract method');
		}

		load() {
			return fetch(this.urlRead, this.urlReadOptions)
			  .then(response => response.json());
		}
	}

	const mainBlock = document.getElementById('table');

	function addBlock(view, element = mainBlock) {
	  if (!view || !view.element) return;

	  element.appendChild(view.element);
	}

	class AbstractView {

	  get template() {
	    throw new Error('This is abstract method');
	  }

	  get element() {
	    if (!this._element) {
	      this._element = this._render();
	      this.bind();
	    }

	    return this._element;
	  }

	  add() {
	    addBlock(this);
	  }

	  update() {

	  }

	  bind() {

	  }

	  unbind() {

	  }

	  _render() {
	    return this._createElement(this.template);
	  }

	  _createElement(template) {
	    let elem = document.createElement('div');

	    elem.innerHTML = template;

	    return elem;
	  }

	}

	class SearchFieldView extends AbstractView {

	  get template() {
	    return `<div class="search-field">
              <input class="search-field__input" type="text" placeholder="поиск">
              <div class="search-field__button"><span></span></div>
            </div>`;
	  }

	  bind() {
	    this._inputField = this.element.querySelector('.search-field__input');
	    this._clearButton = this.element.querySelector('.search-field__button');
	    this._onFilterUsersHandler = () => this.onFilterUsers(this._inputField.value);
	    this._onClearInputHandler = () => this.onClearInput();

	    if (this._inputField) {
	      this._inputField.addEventListener('input', this._onFilterUsersHandler);
	    }

	    if (this._clearButton) {
	      this._clearButton.addEventListener('click', this._onClearInputHandler);
	    }
	  }

	  unbind() {
	    if (this._inputField) {
	      this._inputField.removeEventListener('input', this._onFilerUsersHandler);
	    }

	    if (this._clearButton) {
	      this._clearButton.removeEventListener('click', this._onClearInputHandler);
	    }
	  }

	  onFilterUsers() { }

	  // Очищает пользовательский ввод
	  onClearInput() {
	    this._inputField.value = '';
	    let event = new Event('input');
	    this._inputField.dispatchEvent(event);
	  }
	  
	}

	class SearchField {
	  
	  init() {
	    if (this._view) {
	      this._view.unbind();
	    }

	    this._view = new SearchFieldView();
	    this._view.add();

	    this._view.onFilterUsers = (value) => {
	      app.filterUsers(value);
	    };
	  }

	}

	/**
	 * Возвращает позицию заданного элемента относительно его родителя
	 * 
	 * @param  {HTMLElement} element Элемент, позицию которого требуется найти
	 * @return {number}              Позиция элемента
	 */
	function getElementPosition (element) {
	  let i = 0;

	  while (element = element.previousElementSibling) {
	    i++;
	  }

	  return i;
	}

	/**
	 * Преобразовывает дату из строчного в следующий формат: %hour:%minute %day.%month.%year (12:30 21.04.2014)
	 * @param  {string} date Дата в строчном формате
	 * @return {string}      Дата в заданном формате
	 */
	function getNormalDate(date) {
	  let nDate = new Date(date);
	  let t = nDate.toLocaleString('ru', {'hour': 'numeric', 'minute': 'numeric'});
	  let d = nDate.toLocaleString('ru', {'day': 'numeric', 'month': 'numeric', 'year': 'numeric'});

	  return t + ' ' + d;
	}

	/**
	 * Сортирует массив объектов по указанному ключу и методу
	 * @param  {Array} arr    Массив объектов, который требуется отсортировать
	 * @param  {String} key    Ключ, по которому требуется провести сортировку
	 * @param  {Number} method Метод сортировки: если 1 - сортирует от меньшего к большему,
	 *                                           если 2 - соритрует от большего к меньшему
	 *                                           по-умолчанию: 1.
	 * @return {Array}        Отсортированный массив объектов
	 */
	function sortArrayOfObjects(arr, key, method = 1) {
	  let type = typeof arr[0][key];
	  if (method === 1) {
	    if (type === 'string') return arr.sort((a, b) => a[key].localeCompare(b[key]));
	    else if (type === 'number') return arr.sort((a, b) => a[key] - b[key]);
	  } else if (method === 2) {
	    if (type === 'string') return arr.sort((a, b) => b[key].localeCompare(a[key]));
	    else if (type === 'number') return arr.sort((a, b) => b[key] - a[key]);
	  } else {
	    throw new Error('Method is not supported');
	  }
	}

	/**
	 * Ищет в массиве объектов объект по указанному ключу и значению
	 *  
	 * @param  {Array}  array    Массив объектов
	 * @param  {String} property Свойство объекта
	 * @param  {String} value    Значение объекта
	 * @return {Object}          Искомый объект
	 */
	function getObjectFromArray(array, property, value) {
	  return array.find((obj) => obj[property] === value);
	}

	class UsersTableView extends AbstractView {

	  get template() {
	    if (!this._theadTemp) {
	      this._theadTemp = `<div class="thead-tr">
                          <div class="th th_type_user" data-name="name" data-type="string">Пользователь</div>
                          <div class="th th_type_rating" data-name="rating" data-type="number">Рейтинг</div>
                          <div class="th th_type_stories" data-name="stories" data-type="number">Постов</div>
                          <div class="th th_type_comments" data-name="comments" data-type="number">Комментов</div>
                          <div class="th th_type_date" data-name="date" data-type="string">Зарегистрировался</div>
                        </div>`;
	    }

	    let rows = this._buildRows(app.users.data);

	    let template = `<div class="users-table">
                      <div class="thead">${this._theadTemp}</div>
                      <div class="tbody">${rows.join('')}</div>
                    </div>`;

	    return template;

	  }

	  get rows() {
	    return this.element.querySelectorAll('.tbody-tr');
	  }


	  update(users) {
	    this._tbody.innerHTML = '';

	    for (let user of users) {
	      if (!user.element || user.hidden) continue;
	      
	      this._tbody.appendChild(user.element);
	    }
	  }

	  bind() {
	    this._thead = this.element.querySelector('.thead');
	    this._tbody = this.element.querySelector('.tbody');

	    this._onSortColumnHandler = (e) => this.onSortColumn(e);

	    this._onHighlightColumnHandler = (e) => this.onHighlighColumn(e);

	    this._onDeleteRowHandler = (e) => this.onDeleteRow(e);
	    this._onDragRowHandler = (e) => this.onDragRow(e);

	    if (this._thead) {
	      this._thead.addEventListener('mouseover', this._onHighlightColumnHandler);
	      this._thead.addEventListener('mouseout', this._onHighlightColumnHandler);
	      this._thead.addEventListener('click', this._onSortColumnHandler);
	    }

	    if (this._tbody) {
	      this._tbody.addEventListener('click', this._onDeleteRowHandler);
	      this._tbody.addEventListener('mousedown', this._onDragRowHandler);
	    }
	  }

	  unbind() {
	    if (this._thead) {
	      this._thead.removeEventListener('mouseover', this._onHighlightColumnHandler);
	      this._thead.removeEventListener('mouseout', this._onHighlightColumnHandler);
	      this._thead.removeEventListener('click', this._onSortColumnHandler);
	    }

	    if (this._tbody) {
	      this._tbody.removeEventListener('click', this._onDeleteRowHandler);
	      this._tbody.removeEventListener('click', this._onDragRowHandler);
	    }
	  }

	  // "Подсвечивает" столбец таблицы при наведении на заголовок
	  onHighlighColumn(e) {
	    let target = e.target;

	    if (!target.classList.contains('th')) return;

	    let column = getElementPosition(target);
	    let rows = this._tbody.querySelectorAll('.tbody-tr');

	    for (let row of rows) {
	      row.children[column].classList.toggle('td_highlight');
	    }

	    target.classList.toggle('th_highlight');
	  }

	  // Обрабатывает событие - перетаскивание строк.
	  onDragRow(e) {
	    if (!e.target.closest('.drag-drop')) return;

	    // сохраняем контекст
	    let thisObject = this;
	    let elem = e.target.closest('.tbody-tr');

	    elem.classList.add('tbody-tr_draggable');
	    document.querySelector('body').classList.add('grabbing');

	    this._tbody.addEventListener('mousemove', _onMouseMove);
	    this._tbody.addEventListener('mouseup', _onMouseUp);

	    return false;

	    function _onMouseMove(e) {

	      this.addEventListener('mouseout', _onMouseOut);

	      return false;
	    }

	    function _onMouseOut(e) {
	      if (e.relatedTarget.closest('.tbody-tr')) {
	        let secondElem = e.relatedTarget.closest('.tbody-tr');

	        if (getElementPosition(secondElem) > getElementPosition(elem)) {
	          this.insertBefore(secondElem, elem);
	        } else {
	          this.insertBefore(elem, secondElem);
	        }
	      }
	    }

	    function _onMouseUp(e) {
	      document.querySelector('body').classList.remove('grabbing');
	      elem.classList.remove('tbody-tr_draggable');
	      thisObject._sendRows();
	      
	      this.removeEventListener('mousemove', _onMouseMove);
	      this.removeEventListener('mouseout', _onMouseOut);
	      this.removeEventListener('mouseup', _onMouseUp);
	    }
	  }

	  onSortColumn() { }

	  onDeleteRow() { }

	  _buildRows(users) {
	    let rows = [];

	    for (let user of users) {

	      let normalDate = getNormalDate(user.date);

	      let tr = `<div class="tbody-tr tbody-tr_border-bottom" data-id="${user.id}">
                  <div class="td td_type_user" data-value="${user.name}">
                    <span class="td__content td__avatar td_type_user__content">
                      <img class="td_type_user__img" src="${user.avatar}">
                    </span>
                    <span class="td__content td__username td_type_user__content">${user.name}</span>
                  </div>
                  <div class="td td_type_rating" data-value="${user.rating}">
                    <span class="td__content td__rating">${user.rating}</span>
                  </div>
                  <div class="td td_type_stories" data-value="${user.stories}">
                    <span class="td__content td__stories">${user.stories}</span>
                  </div>
                  <div class="td td_type_comments" data-value="${user.comments}">
                    <span class="td__content td__comments">${user.comments}</span></div>
                  <div class="td td_type_date" data-value="${user.date}">
                    <span class="td__content td__normalDate">${normalDate}</span>
                    <div class="drag-drop"><span class="drag-drop__span"></span></div>
                  </div>
                </div>`;

	      rows.push(tr);
	    }

	    return rows;
	  }

	  // Отправляет строки таблицы в Application
	  _sendRows() {
	    app.reloadElements('users', this.element.querySelectorAll('.tbody-tr'));
	  }
	  
	}

	class UsersTable {
	  
	  constructor(users) {
	    app.users.data.forEach((user, i) => {
	      user.id = i;
	    });

	    this._sortingData = {};
	  }

	  init() {
	    if (this._view) {
	      this._view.unbind();
	    }

	    this._view = new UsersTableView();
	    this._view.add();
	    this._bindElementsToModel();

	    // Сортирует пользователей и обновляет представление
	    this._view.onSortColumn = (e) => {
	      if (!e.target.classList.contains('th')) return;

	      let key = e.target.dataset.name;

	      if (this._sortingData[key]) {
	        this._sortingData[key]++;
	        if (this._sortingData[key] > 2) {
	          delete this._sortingData[key];
	        }
	      } else {
	        this._sortingData = {};
	        this._sortingData[key] = 1;
	      }

	      if (this._sortingData[key]) {
	        app.users.data = sortArrayOfObjects(app.users.data, key, this._sortingData[key]);
	      } else {
	        app.users.data = sortArrayOfObjects(app.users.data, 'id', 1);
	      }

	      this._view.update(app.users.data);
	    };

	    // Удаляет пользователя и обновляет представление
	    this._view.onDeleteRow = (e) => {
	      if (!e.target.closest('.tbody-tr')) return;
	      if (e.ctrlKey || e.metaKey) {
	        let id = +e.target.closest('.tbody-tr').dataset.id;
	        let userIndex = app.users.data.findIndex((user) => user.id === id);

	        app.users.data.splice(userIndex, 1);

	        this.reload();
	      } 
	    };

	  }

	  reload() {
	    this._view.update(app.users.data);
	  }

	  // Привязывает элементы DOM (строки таблицы) к соответствующему объекту-пользователю  
	  _bindElementsToModel() {
	    let elements = this._view.rows;

	    app.users.data.forEach((user, i) => {
	      user.element = elements[i];
	    });
	  }


	  //---------------------- Далее - функции-обработчики событий. ---------------
	  

	  /**
	   * Фильтрует пользователей согласно введенному запросу. Каждому объекту-пользователю,
	   * не прошедшему фильтр, присваивается свойство hidden = true.
	   * 
	   * @param  {Array} users Массив объектов-пользователей
	   * @param  {String} value Фильтр
	   * @return {Array}       Отфильтрованный массив пользователей.
	   */
	  filterUsers(users, value) {
	    let re = _getRegExp(value);

	    for (let user of users) {
	      if (re.test(user.name)) {
	        user.hidden = false;
	      } else {
	        user.hidden = true;
	      }
	    }

	    this.reload();
	    return users;

	    /**
	     * Возвращает регулярное выражение для фильтра пользователей
	     * согласно следующему паттерну:
	     *  1) регистронезависимо;
	     *  2) если слово начинается со знака "*", ищет подстроку, иначе - по началу строки;
	     *  3) пробел в запросе означает операцию "ИЛИ".
	     * 
	     * @param  {string} value Запрос, введенный пользователем
	     * @return {RegExp}       Регулярное выражение
	     */
	    function _getRegExp(value) {
	      let queries = value.split(' ');
	      let re = '';

	      for (let query of queries) {
	        if (/\w/.test(query)) {
	          re += '(';
	          if(!/^\*/.test(query)) re += '^';
	          re += query.match(/\w+/gi).join('');
	          re += ')';
	        }
	      }

	      re = re.replace(/\)\(/g, ')|(');
	      re = new RegExp(re, 'i');

	      return re;
	    }
	  }

	}

	class DataStore {

		constructor(newData) {
			this._data = newData;
		}

		get data() {
			return this._data;
		}

		set data(newData) {
			this._data = newData;
		}
	}

	class Application {

	  constructor() {
	    this._model = new class extends AbstractModel {
	      get urlRead() {
	        return 'https://pikabu.ru/page/interview/frontend/users.php';
	      }

	      get urlReadOptions() {
	        return {'headers': {'X-CSRF-Token': 'interview'}}
	      }
	    }();
	  }

	  init() {
	    this._model.load()
	      .then(
	        response => {
	          this.users = new DataStore(response);
	          this._searchField = new SearchField();
	          this._usersTable = new UsersTable();

	          this._searchField.init();
	          this._usersTable.init();
	        })

	      .catch(error => {
	        console.log(error);
	      });
	  }

	  filterUsers(value) {
	    this.users.data = this._usersTable.filterUsers(this.users.data, value);
	  }

	  /**
	   * Получает новый порядок элементов от представлений и обновляет массив данных
	   * 
	   * @param  {String}    dataName Наименование массива данных в Application
	   * @param  {NODE List} elements Коллекция элементов
	   * @return {null}
	   */
	  reloadElements(dataName, elements) {
	    let newData = [];

	    if (dataName === 'users') {
	      elements.forEach((element, i) => {
	        let id = +element.dataset.id;
	        let user = getObjectFromArray(this.users.data, 'id', id);
	        newData.push(user);
	      });

	      this.users.data = newData;
	    } else {
	      throw new Error('dataName is not exist');
	    }
	  }
	}

	const app = new Application();

	/**
	 * Старался придерживаться шаблона MVC, но так как опытом в построении
	 * архитектуры приложения я похвастаться не могу, местами могут быть
	 * некоторые отклонения. Вот краткое описание взаимодействия модулей:
	 *
	 * 1. main.js инициализирует приложение.
	 * 2. application.js - главный управляющий модуль. Он инициализирует все
	 *    необходимые модели и контроллеры блоков, которые в свою очередь
	 *    создают представления своих блоков. Также данный модуль
	 *    обеспечивает обмен данными между моделями и блоками.
	 * 3. abstract-view.js - абстрактное представление, от которого наследуются
	 *    представления блоков.
	 * 4. abstract-model.js - абстрактная модель.
	 * 5. blocks/ содержит управляющие модули блоков и их представления.
	 */

	app.init();

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsianMvYWJzdHJhY3QtbW9kZWwuanMiLCJqcy92aWV3LW1hbmFnZXIuanMiLCJqcy9hYnN0cmFjdC12aWV3LmpzIiwianMvYmxvY2tzL3NlYXJjaC1maWVsZC12aWV3LmpzIiwianMvYmxvY2tzL3NlYXJjaC1maWVsZC5qcyIsImpzL3V0aWxzLmpzIiwianMvYmxvY2tzL3VzZXJzLXRhYmxlLXZpZXcuanMiLCJqcy9ibG9ja3MvdXNlcnMtdGFibGUuanMiLCJqcy9kYXRhLXN0b3JlLmpzIiwianMvYXBwbGljYXRpb24uanMiLCJqcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0TW9kZWwge1xuXG5cdGdldCB1cmxSZWFkKCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignVGhpcyBpcyBhYnN0cmFjdCBtZXRob2QnKTtcblx0fVxuXG5cdGdldCB1cmxSZWFkT3B0aW9ucygpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgaXMgYWJzdHJhY3QgbWV0aG9kJyk7XG5cdH1cblxuXHRsb2FkKCkge1xuXHRcdHJldHVybiBmZXRjaCh0aGlzLnVybFJlYWQsIHRoaXMudXJsUmVhZE9wdGlvbnMpXG5cdFx0ICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpO1xuXHR9XG59IiwiY29uc3QgbWFpbkJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYmxlJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRCbG9jayh2aWV3LCBlbGVtZW50ID0gbWFpbkJsb2NrKSB7XG4gIGlmICghdmlldyB8fCAhdmlldy5lbGVtZW50KSByZXR1cm47XG5cbiAgZWxlbWVudC5hcHBlbmRDaGlsZCh2aWV3LmVsZW1lbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQmxvY2sodmlldywgZWxlbWVudCA9IG1haW5CbG9jaykge1xuXHRlbGVtZW50LnJlbW92ZUNoaWxkKHZpZXcuZWxlbWVudCk7XG59IiwiaW1wb3J0IHthZGRCbG9jaywgcmVtb3ZlQmxvY2t9IGZyb20gJy4vdmlldy1tYW5hZ2VyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJzdHJhY3RWaWV3IHtcblxuICBnZXQgdGVtcGxhdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGlzIGFic3RyYWN0IG1ldGhvZCcpO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgaWYgKCF0aGlzLl9lbGVtZW50KSB7XG4gICAgICB0aGlzLl9lbGVtZW50ID0gdGhpcy5fcmVuZGVyKCk7XG4gICAgICB0aGlzLmJpbmQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudDtcbiAgfVxuXG4gIGFkZCgpIHtcbiAgICBhZGRCbG9jayh0aGlzKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcblxuICB9XG5cbiAgYmluZCgpIHtcblxuICB9XG5cbiAgdW5iaW5kKCkge1xuXG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVFbGVtZW50KHRoaXMudGVtcGxhdGUpO1xuICB9XG5cbiAgX2NyZWF0ZUVsZW1lbnQodGVtcGxhdGUpIHtcbiAgICBsZXQgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgZWxlbS5pbm5lckhUTUwgPSB0ZW1wbGF0ZTtcblxuICAgIHJldHVybiBlbGVtO1xuICB9XG5cbn1cbiIsImltcG9ydCBBYnN0cmFjdFZpZXcgZnJvbSAnLi4vYWJzdHJhY3Qtdmlldyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaEZpZWxkVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIHJldHVybiBgPGRpdiBjbGFzcz1cInNlYXJjaC1maWVsZFwiPlxuICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJzZWFyY2gtZmllbGRfX2lucHV0XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cItC/0L7QuNGB0LpcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNlYXJjaC1maWVsZF9fYnV0dG9uXCI+PHNwYW4+PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIGJpbmQoKSB7XG4gICAgdGhpcy5faW5wdXRGaWVsZCA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLWZpZWxkX19pbnB1dCcpO1xuICAgIHRoaXMuX2NsZWFyQnV0dG9uID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtZmllbGRfX2J1dHRvbicpO1xuICAgIHRoaXMuX29uRmlsdGVyVXNlcnNIYW5kbGVyID0gKCkgPT4gdGhpcy5vbkZpbHRlclVzZXJzKHRoaXMuX2lucHV0RmllbGQudmFsdWUpO1xuICAgIHRoaXMuX29uQ2xlYXJJbnB1dEhhbmRsZXIgPSAoKSA9PiB0aGlzLm9uQ2xlYXJJbnB1dCgpO1xuXG4gICAgaWYgKHRoaXMuX2lucHV0RmllbGQpIHtcbiAgICAgIHRoaXMuX2lucHV0RmllbGQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLl9vbkZpbHRlclVzZXJzSGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NsZWFyQnV0dG9uKSB7XG4gICAgICB0aGlzLl9jbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xlYXJJbnB1dEhhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIHVuYmluZCgpIHtcbiAgICBpZiAodGhpcy5faW5wdXRGaWVsZCkge1xuICAgICAgdGhpcy5faW5wdXRGaWVsZC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMuX29uRmlsZXJVc2Vyc0hhbmRsZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jbGVhckJ1dHRvbikge1xuICAgICAgdGhpcy5fY2xlYXJCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsZWFySW5wdXRIYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICBvbkZpbHRlclVzZXJzKCkgeyB9XG5cbiAgLy8g0J7Rh9C40YnQsNC10YIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GM0YHQutC40Lkg0LLQstC+0LRcbiAgb25DbGVhcklucHV0KCkge1xuICAgIHRoaXMuX2lucHV0RmllbGQudmFsdWUgPSAnJztcbiAgICBsZXQgZXZlbnQgPSBuZXcgRXZlbnQoJ2lucHV0Jyk7XG4gICAgdGhpcy5faW5wdXRGaWVsZC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxuICBcbn1cbiIsImltcG9ydCBTZWFyY2hGaWVsZFZpZXcgZnJvbSAnLi9zZWFyY2gtZmllbGQtdmlldyc7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi4vYXBwbGljYXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2hGaWVsZCB7XG4gIFxuICBpbml0KCkge1xuICAgIGlmICh0aGlzLl92aWV3KSB7XG4gICAgICB0aGlzLl92aWV3LnVuYmluZCgpO1xuICAgIH1cblxuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU2VhcmNoRmllbGRWaWV3KCk7XG4gICAgdGhpcy5fdmlldy5hZGQoKTtcblxuICAgIHRoaXMuX3ZpZXcub25GaWx0ZXJVc2VycyA9ICh2YWx1ZSkgPT4ge1xuICAgICAgQXBwbGljYXRpb24uZmlsdGVyVXNlcnModmFsdWUpO1xuICAgIH1cbiAgfVxuXG59XG4iLCIvKipcbiAqINCS0L7Qt9Cy0YDQsNGJ0LDQtdGCINC/0L7Qt9C40YbQuNGOINC30LDQtNCw0L3QvdC+0LPQviDRjdC70LXQvNC10L3RgtCwINC+0YLQvdC+0YHQuNGC0LXQu9GM0L3QviDQtdCz0L4g0YDQvtC00LjRgtC10LvRj1xuICogXG4gKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gZWxlbWVudCDQrdC70LXQvNC10L3Rgiwg0L/QvtC30LjRhtC40Y4g0LrQvtGC0L7RgNC+0LPQviDRgtGA0LXQsdGD0LXRgtGB0Y8g0L3QsNC50YLQuFxuICogQHJldHVybiB7bnVtYmVyfSAgICAgICAgICAgICAg0J/QvtC30LjRhtC40Y8g0Y3Qu9C10LzQtdC90YLQsFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudFBvc2l0aW9uIChlbGVtZW50KSB7XG4gIGxldCBpID0gMDtcblxuICB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgIGkrKztcbiAgfVxuXG4gIHJldHVybiBpO1xufVxuXG4vKipcbiAqINCf0YDQtdC+0LHRgNCw0LfQvtCy0YvQstCw0LXRgiDQtNCw0YLRgyDQuNC3INGB0YLRgNC+0YfQvdC+0LPQviDQsiDRgdC70LXQtNGD0Y7RidC40Lkg0YTQvtGA0LzQsNGCOiAlaG91cjolbWludXRlICVkYXkuJW1vbnRoLiV5ZWFyICgxMjozMCAyMS4wNC4yMDE0KVxuICogQHBhcmFtICB7c3RyaW5nfSBkYXRlINCU0LDRgtCwINCyINGB0YLRgNC+0YfQvdC+0Lwg0YTQvtGA0LzQsNGC0LVcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICDQlNCw0YLQsCDQsiDQt9Cw0LTQsNC90L3QvtC8INGE0L7RgNC80LDRgtC1XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3JtYWxEYXRlKGRhdGUpIHtcbiAgbGV0IG5EYXRlID0gbmV3IERhdGUoZGF0ZSk7XG4gIGxldCB0ID0gbkRhdGUudG9Mb2NhbGVTdHJpbmcoJ3J1Jywgeydob3VyJzogJ251bWVyaWMnLCAnbWludXRlJzogJ251bWVyaWMnfSk7XG4gIGxldCBkID0gbkRhdGUudG9Mb2NhbGVTdHJpbmcoJ3J1JywgeydkYXknOiAnbnVtZXJpYycsICdtb250aCc6ICdudW1lcmljJywgJ3llYXInOiAnbnVtZXJpYyd9KTtcblxuICByZXR1cm4gdCArICcgJyArIGQ7XG59XG5cbi8qKlxuICog0KHQvtGA0YLQuNGA0YPQtdGCINC80LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyINC/0L4g0YPQutCw0LfQsNC90L3QvtC80YMg0LrQu9GO0YfRgyDQuCDQvNC10YLQvtC00YNcbiAqIEBwYXJhbSAge0FycmF5fSBhcnIgICAg0JzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIsINC60L7RgtC+0YDRi9C5INGC0YDQtdCx0YPQtdGC0YHRjyDQvtGC0YHQvtGA0YLQuNGA0L7QstCw0YLRjFxuICogQHBhcmFtICB7U3RyaW5nfSBrZXkgICAg0JrQu9GO0YcsINC/0L4g0LrQvtGC0L7RgNC+0LzRgyDRgtGA0LXQsdGD0LXRgtGB0Y8g0L/RgNC+0LLQtdGB0YLQuCDRgdC+0YDRgtC40YDQvtCy0LrRg1xuICogQHBhcmFtICB7TnVtYmVyfSBtZXRob2Qg0JzQtdGC0L7QtCDRgdC+0YDRgtC40YDQvtCy0LrQuDog0LXRgdC70LggMSAtINGB0L7RgNGC0LjRgNGD0LXRgiDQvtGCINC80LXQvdGM0YjQtdCz0L4g0Log0LHQvtC70YzRiNC10LzRgyxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgINC10YHQu9C4IDIgLSDRgdC+0YDQuNGC0YDRg9C10YIg0L7RgiDQsdC+0LvRjNGI0LXQs9C+INC6INC80LXQvdGM0YjQtdC80YNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgINC/0L4t0YPQvNC+0LvRh9Cw0L3QuNGOOiAxLlxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICDQntGC0YHQvtGA0YLQuNGA0L7QstCw0L3QvdGL0Lkg0LzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvcnRBcnJheU9mT2JqZWN0cyhhcnIsIGtleSwgbWV0aG9kID0gMSkge1xuICBsZXQgdHlwZSA9IHR5cGVvZiBhcnJbMF1ba2V5XTtcblxuICBsZXQgc29ydGVkQXJyYXk7XG4gIGlmIChtZXRob2QgPT09IDEpIHtcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiBhcnIuc29ydCgoYSwgYikgPT4gYVtrZXldLmxvY2FsZUNvbXBhcmUoYltrZXldKSk7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBhcnIuc29ydCgoYSwgYikgPT4gYVtrZXldIC0gYltrZXldKTtcbiAgfSBlbHNlIGlmIChtZXRob2QgPT09IDIpIHtcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiBhcnIuc29ydCgoYSwgYikgPT4gYltrZXldLmxvY2FsZUNvbXBhcmUoYVtrZXldKSk7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBhcnIuc29ydCgoYSwgYikgPT4gYltrZXldIC0gYVtrZXldKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cbn1cblxuLyoqXG4gKiDQmNGJ0LXRgiDQsiDQvNCw0YHRgdC40LLQtSDQvtCx0YrQtdC60YLQvtCyINC+0LHRitC10LrRgiDQv9C+INGD0LrQsNC30LDQvdC90L7QvNGDINC60LvRjtGH0YMg0Lgg0LfQvdCw0YfQtdC90LjRjlxuICogIFxuICogQHBhcmFtICB7QXJyYXl9ICBhcnJheSAgICDQnNCw0YHRgdC40LIg0L7QsdGK0LXQutGC0L7QslxuICogQHBhcmFtICB7U3RyaW5nfSBwcm9wZXJ0eSDQodCy0L7QudGB0YLQstC+INC+0LHRitC10LrRgtCwXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHZhbHVlICAgINCX0L3QsNGH0LXQvdC40LUg0L7QsdGK0LXQutGC0LBcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAg0JjRgdC60L7QvNGL0Lkg0L7QsdGK0LXQutGCXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPYmplY3RGcm9tQXJyYXkoYXJyYXksIHByb3BlcnR5LCB2YWx1ZSkge1xuICByZXR1cm4gYXJyYXkuZmluZCgob2JqKSA9PiBvYmpbcHJvcGVydHldID09PSB2YWx1ZSk7XG59IiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tICcuLi9hYnN0cmFjdC12aWV3JztcbmltcG9ydCB7Z2V0Tm9ybWFsRGF0ZSwgZ2V0RWxlbWVudFBvc2l0aW9ufSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi4vYXBwbGljYXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2Vyc1RhYmxlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG5cbiAgZ2V0IHRlbXBsYXRlKCkge1xuICAgIGlmICghdGhpcy5fdGhlYWRUZW1wKSB7XG4gICAgICB0aGlzLl90aGVhZFRlbXAgPSBgPGRpdiBjbGFzcz1cInRoZWFkLXRyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aCB0aF90eXBlX3VzZXJcIiBkYXRhLW5hbWU9XCJuYW1lXCIgZGF0YS10eXBlPVwic3RyaW5nXCI+0J/QvtC70YzQt9C+0LLQsNGC0LXQu9GMPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aCB0aF90eXBlX3JhdGluZ1wiIGRhdGEtbmFtZT1cInJhdGluZ1wiIGRhdGEtdHlwZT1cIm51bWJlclwiPtCg0LXQudGC0LjQvdCzPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aCB0aF90eXBlX3N0b3JpZXNcIiBkYXRhLW5hbWU9XCJzdG9yaWVzXCIgZGF0YS10eXBlPVwibnVtYmVyXCI+0J/QvtGB0YLQvtCyPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aCB0aF90eXBlX2NvbW1lbnRzXCIgZGF0YS1uYW1lPVwiY29tbWVudHNcIiBkYXRhLXR5cGU9XCJudW1iZXJcIj7QmtC+0LzQvNC10L3RgtC+0LI8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRoIHRoX3R5cGVfZGF0ZVwiIGRhdGEtbmFtZT1cImRhdGVcIiBkYXRhLXR5cGU9XCJzdHJpbmdcIj7Ql9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0LvRgdGPPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgIH1cblxuICAgIGxldCByb3dzID0gdGhpcy5fYnVpbGRSb3dzKEFwcGxpY2F0aW9uLnVzZXJzLmRhdGEpO1xuXG4gICAgbGV0IHRlbXBsYXRlID0gYDxkaXYgY2xhc3M9XCJ1c2Vycy10YWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aGVhZFwiPiR7dGhpcy5fdGhlYWRUZW1wfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0Ym9keVwiPiR7cm93cy5qb2luKCcnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YFxuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuXG4gIH1cblxuICBnZXQgcm93cygpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50Ym9keS10cicpO1xuICB9XG5cblxuICB1cGRhdGUodXNlcnMpIHtcbiAgICB0aGlzLl90Ym9keS5pbm5lckhUTUwgPSAnJztcblxuICAgIGZvciAobGV0IHVzZXIgb2YgdXNlcnMpIHtcbiAgICAgIGlmICghdXNlci5lbGVtZW50IHx8IHVzZXIuaGlkZGVuKSBjb250aW51ZTtcbiAgICAgIFxuICAgICAgdGhpcy5fdGJvZHkuYXBwZW5kQ2hpbGQodXNlci5lbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICBiaW5kKCkge1xuICAgIHRoaXMuX3RoZWFkID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50aGVhZCcpO1xuICAgIHRoaXMuX3Rib2R5ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50Ym9keScpO1xuXG4gICAgdGhpcy5fb25Tb3J0Q29sdW1uSGFuZGxlciA9IChlKSA9PiB0aGlzLm9uU29ydENvbHVtbihlKTtcblxuICAgIHRoaXMuX29uSGlnaGxpZ2h0Q29sdW1uSGFuZGxlciA9IChlKSA9PiB0aGlzLm9uSGlnaGxpZ2hDb2x1bW4oZSk7XG5cbiAgICB0aGlzLl9vbkRlbGV0ZVJvd0hhbmRsZXIgPSAoZSkgPT4gdGhpcy5vbkRlbGV0ZVJvdyhlKTtcbiAgICB0aGlzLl9vbkRyYWdSb3dIYW5kbGVyID0gKGUpID0+IHRoaXMub25EcmFnUm93KGUpO1xuXG4gICAgaWYgKHRoaXMuX3RoZWFkKSB7XG4gICAgICB0aGlzLl90aGVhZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLl9vbkhpZ2hsaWdodENvbHVtbkhhbmRsZXIpO1xuICAgICAgdGhpcy5fdGhlYWQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB0aGlzLl9vbkhpZ2hsaWdodENvbHVtbkhhbmRsZXIpO1xuICAgICAgdGhpcy5fdGhlYWQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vblNvcnRDb2x1bW5IYW5kbGVyKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGJvZHkpIHtcbiAgICAgIHRoaXMuX3Rib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25EZWxldGVSb3dIYW5kbGVyKTtcbiAgICAgIHRoaXMuX3Rib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uRHJhZ1Jvd0hhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIHVuYmluZCgpIHtcbiAgICBpZiAodGhpcy5fdGhlYWQpIHtcbiAgICAgIHRoaXMuX3RoZWFkLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX29uSGlnaGxpZ2h0Q29sdW1uSGFuZGxlcik7XG4gICAgICB0aGlzLl90aGVhZC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMuX29uSGlnaGxpZ2h0Q29sdW1uSGFuZGxlcik7XG4gICAgICB0aGlzLl90aGVhZC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uU29ydENvbHVtbkhhbmRsZXIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90Ym9keSkge1xuICAgICAgdGhpcy5fdGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkRlbGV0ZVJvd0hhbmRsZXIpO1xuICAgICAgdGhpcy5fdGJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkRyYWdSb3dIYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICAvLyBcItCf0L7QtNGB0LLQtdGH0LjQstCw0LXRglwiINGB0YLQvtC70LHQtdGGINGC0LDQsdC70LjRhtGLINC/0YDQuCDQvdCw0LLQtdC00LXQvdC40Lgg0L3QsCDQt9Cw0LPQvtC70L7QstC+0LpcbiAgb25IaWdobGlnaENvbHVtbihlKSB7XG4gICAgbGV0IHRhcmdldCA9IGUudGFyZ2V0O1xuXG4gICAgaWYgKCF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aCcpKSByZXR1cm47XG5cbiAgICBsZXQgY29sdW1uID0gZ2V0RWxlbWVudFBvc2l0aW9uKHRhcmdldCk7XG4gICAgbGV0IHJvd3MgPSB0aGlzLl90Ym9keS5xdWVyeVNlbGVjdG9yQWxsKCcudGJvZHktdHInKTtcblxuICAgIGZvciAobGV0IHJvdyBvZiByb3dzKSB7XG4gICAgICByb3cuY2hpbGRyZW5bY29sdW1uXS5jbGFzc0xpc3QudG9nZ2xlKCd0ZF9oaWdobGlnaHQnKTtcbiAgICB9XG5cbiAgICB0YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgndGhfaGlnaGxpZ2h0Jyk7XG4gIH1cblxuICAvLyDQntCx0YDQsNCx0LDRgtGL0LLQsNC10YIg0YHQvtCx0YvRgtC40LUgLSDQv9C10YDQtdGC0LDRgdC60LjQstCw0L3QuNC1INGB0YLRgNC+0LouXG4gIG9uRHJhZ1JvdyhlKSB7XG4gICAgaWYgKCFlLnRhcmdldC5jbG9zZXN0KCcuZHJhZy1kcm9wJykpIHJldHVybjtcblxuICAgIC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQutC+0L3RgtC10LrRgdGCXG4gICAgbGV0IHRoaXNPYmplY3QgPSB0aGlzO1xuICAgIGxldCBlbGVtID0gZS50YXJnZXQuY2xvc2VzdCgnLnRib2R5LXRyJyk7XG5cbiAgICBlbGVtLmNsYXNzTGlzdC5hZGQoJ3Rib2R5LXRyX2RyYWdnYWJsZScpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5jbGFzc0xpc3QuYWRkKCdncmFiYmluZycpO1xuXG4gICAgdGhpcy5fdGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgX29uTW91c2VNb3ZlKTtcbiAgICB0aGlzLl90Ym9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgX29uTW91c2VVcCk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBfb25Nb3VzZU1vdmUoZSkge1xuXG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgX29uTW91c2VPdXQpO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uTW91c2VPdXQoZSkge1xuICAgICAgaWYgKGUucmVsYXRlZFRhcmdldC5jbG9zZXN0KCcudGJvZHktdHInKSkge1xuICAgICAgICBsZXQgc2Vjb25kRWxlbSA9IGUucmVsYXRlZFRhcmdldC5jbG9zZXN0KCcudGJvZHktdHInKTtcblxuICAgICAgICBpZiAoZ2V0RWxlbWVudFBvc2l0aW9uKHNlY29uZEVsZW0pID4gZ2V0RWxlbWVudFBvc2l0aW9uKGVsZW0pKSB7XG4gICAgICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoc2Vjb25kRWxlbSwgZWxlbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZWxlbSwgc2Vjb25kRWxlbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25Nb3VzZVVwKGUpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5jbGFzc0xpc3QucmVtb3ZlKCdncmFiYmluZycpO1xuICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCd0Ym9keS10cl9kcmFnZ2FibGUnKTtcbiAgICAgIHRoaXNPYmplY3QuX3NlbmRSb3dzKCk7XG4gICAgICBcbiAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgX29uTW91c2VNb3ZlKTtcbiAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBfb25Nb3VzZU91dCk7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBfb25Nb3VzZVVwKTtcbiAgICB9XG4gIH1cblxuICBvblNvcnRDb2x1bW4oKSB7IH1cblxuICBvbkRlbGV0ZVJvdygpIHsgfVxuXG4gIF9idWlsZFJvd3ModXNlcnMpIHtcbiAgICBsZXQgcm93cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgdXNlciBvZiB1c2Vycykge1xuXG4gICAgICBsZXQgbm9ybWFsRGF0ZSA9IGdldE5vcm1hbERhdGUodXNlci5kYXRlKTtcblxuICAgICAgbGV0IHRyID0gYDxkaXYgY2xhc3M9XCJ0Ym9keS10ciB0Ym9keS10cl9ib3JkZXItYm90dG9tXCIgZGF0YS1pZD1cIiR7dXNlci5pZH1cIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZCB0ZF90eXBlX3VzZXJcIiBkYXRhLXZhbHVlPVwiJHt1c2VyLm5hbWV9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGRfX2NvbnRlbnQgdGRfX2F2YXRhciB0ZF90eXBlX3VzZXJfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwidGRfdHlwZV91c2VyX19pbWdcIiBzcmM9XCIke3VzZXIuYXZhdGFyfVwiPlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGRfX2NvbnRlbnQgdGRfX3VzZXJuYW1lIHRkX3R5cGVfdXNlcl9fY29udGVudFwiPiR7dXNlci5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRkIHRkX3R5cGVfcmF0aW5nXCIgZGF0YS12YWx1ZT1cIiR7dXNlci5yYXRpbmd9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGRfX2NvbnRlbnQgdGRfX3JhdGluZ1wiPiR7dXNlci5yYXRpbmd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGQgdGRfdHlwZV9zdG9yaWVzXCIgZGF0YS12YWx1ZT1cIiR7dXNlci5zdG9yaWVzfVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRkX19jb250ZW50IHRkX19zdG9yaWVzXCI+JHt1c2VyLnN0b3JpZXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGQgdGRfdHlwZV9jb21tZW50c1wiIGRhdGEtdmFsdWU9XCIke3VzZXIuY29tbWVudHN9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGRfX2NvbnRlbnQgdGRfX2NvbW1lbnRzXCI+JHt1c2VyLmNvbW1lbnRzfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZCB0ZF90eXBlX2RhdGVcIiBkYXRhLXZhbHVlPVwiJHt1c2VyLmRhdGV9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGRfX2NvbnRlbnQgdGRfX25vcm1hbERhdGVcIj4ke25vcm1hbERhdGV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZHJhZy1kcm9wXCI+PHNwYW4gY2xhc3M9XCJkcmFnLWRyb3BfX3NwYW5cIj48L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG4gICAgICByb3dzLnB1c2godHIpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgLy8g0J7RgtC/0YDQsNCy0LvRj9C10YIg0YHRgtGA0L7QutC4INGC0LDQsdC70LjRhtGLINCyIEFwcGxpY2F0aW9uXG4gIF9zZW5kUm93cygpIHtcbiAgICBBcHBsaWNhdGlvbi5yZWxvYWRFbGVtZW50cygndXNlcnMnLCB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRib2R5LXRyJykpO1xuICB9XG4gIFxufVxuIiwiaW1wb3J0IFVzZXJzVGFibGVWaWV3IGZyb20gJy4vdXNlcnMtdGFibGUtdmlldyc7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi4vYXBwbGljYXRpb24nO1xuaW1wb3J0IHtzb3J0QXJyYXlPZk9iamVjdHN9IGZyb20gJy4uL3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2Vyc1RhYmxlIHtcbiAgXG4gIGNvbnN0cnVjdG9yKHVzZXJzKSB7XG4gICAgQXBwbGljYXRpb24udXNlcnMuZGF0YS5mb3JFYWNoKCh1c2VyLCBpKSA9PiB7XG4gICAgICB1c2VyLmlkID0gaTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NvcnRpbmdEYXRhID0ge31cbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXcpIHtcbiAgICAgIHRoaXMuX3ZpZXcudW5iaW5kKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fdmlldyA9IG5ldyBVc2Vyc1RhYmxlVmlldygpO1xuICAgIHRoaXMuX3ZpZXcuYWRkKCk7XG4gICAgdGhpcy5fYmluZEVsZW1lbnRzVG9Nb2RlbCgpO1xuXG4gICAgLy8g0KHQvtGA0YLQuNGA0YPQtdGCINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC5INC4INC+0LHQvdC+0LLQu9GP0LXRgiDQv9GA0LXQtNGB0YLQsNCy0LvQtdC90LjQtVxuICAgIHRoaXMuX3ZpZXcub25Tb3J0Q29sdW1uID0gKGUpID0+IHtcbiAgICAgIGlmICghZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCd0aCcpKSByZXR1cm47XG5cbiAgICAgIGxldCBrZXkgPSBlLnRhcmdldC5kYXRhc2V0Lm5hbWU7XG5cbiAgICAgIGlmICh0aGlzLl9zb3J0aW5nRGF0YVtrZXldKSB7XG4gICAgICAgIHRoaXMuX3NvcnRpbmdEYXRhW2tleV0rKztcbiAgICAgICAgaWYgKHRoaXMuX3NvcnRpbmdEYXRhW2tleV0gPiAyKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX3NvcnRpbmdEYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NvcnRpbmdEYXRhID0ge307XG4gICAgICAgIHRoaXMuX3NvcnRpbmdEYXRhW2tleV0gPSAxO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fc29ydGluZ0RhdGFba2V5XSkge1xuICAgICAgICBBcHBsaWNhdGlvbi51c2Vycy5kYXRhID0gc29ydEFycmF5T2ZPYmplY3RzKEFwcGxpY2F0aW9uLnVzZXJzLmRhdGEsIGtleSwgdGhpcy5fc29ydGluZ0RhdGFba2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBBcHBsaWNhdGlvbi51c2Vycy5kYXRhID0gc29ydEFycmF5T2ZPYmplY3RzKEFwcGxpY2F0aW9uLnVzZXJzLmRhdGEsICdpZCcsIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl92aWV3LnVwZGF0ZShBcHBsaWNhdGlvbi51c2Vycy5kYXRhKTtcbiAgICB9XG5cbiAgICAvLyDQo9C00LDQu9GP0LXRgiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8g0Lgg0L7QsdC90L7QstC70Y/QtdGCINC/0YDQtdC00YHRgtCw0LLQu9C10L3QuNC1XG4gICAgdGhpcy5fdmlldy5vbkRlbGV0ZVJvdyA9IChlKSA9PiB7XG4gICAgICBpZiAoIWUudGFyZ2V0LmNsb3Nlc3QoJy50Ym9keS10cicpKSByZXR1cm47XG4gICAgICBpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkge1xuICAgICAgICBsZXQgaWQgPSArZS50YXJnZXQuY2xvc2VzdCgnLnRib2R5LXRyJykuZGF0YXNldC5pZDtcbiAgICAgICAgbGV0IHVzZXJJbmRleCA9IEFwcGxpY2F0aW9uLnVzZXJzLmRhdGEuZmluZEluZGV4KCh1c2VyKSA9PiB1c2VyLmlkID09PSBpZCk7XG5cbiAgICAgICAgQXBwbGljYXRpb24udXNlcnMuZGF0YS5zcGxpY2UodXNlckluZGV4LCAxKTtcblxuICAgICAgICB0aGlzLnJlbG9hZCgpO1xuICAgICAgfSBcbiAgICB9XG5cbiAgfVxuXG4gIHJlbG9hZCgpIHtcbiAgICB0aGlzLl92aWV3LnVwZGF0ZShBcHBsaWNhdGlvbi51c2Vycy5kYXRhKTtcbiAgfVxuXG4gIC8vINCf0YDQuNCy0Y/Qt9GL0LLQsNC10YIg0Y3Qu9C10LzQtdC90YLRiyBET00gKNGB0YLRgNC+0LrQuCDRgtCw0LHQu9C40YbRiykg0Log0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQtdC80YMg0L7QsdGK0LXQutGC0YMt0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GOICBcbiAgX2JpbmRFbGVtZW50c1RvTW9kZWwoKSB7XG4gICAgbGV0IGVsZW1lbnRzID0gdGhpcy5fdmlldy5yb3dzO1xuXG4gICAgQXBwbGljYXRpb24udXNlcnMuZGF0YS5mb3JFYWNoKCh1c2VyLCBpKSA9PiB7XG4gICAgICB1c2VyLmVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tINCU0LDQu9C10LUgLSDRhNGD0L3QutGG0LjQuC3QvtCx0YDQsNCx0L7RgtGH0LjQutC4INGB0L7QsdGL0YLQuNC5LiAtLS0tLS0tLS0tLS0tLS1cbiAgXG5cbiAgLyoqXG4gICAqINCk0LjQu9GM0YLRgNGD0LXRgiDQv9C+0LvRjNC30L7QstCw0YLQtdC70LXQuSDRgdC+0LPQu9Cw0YHQvdC+INCy0LLQtdC00LXQvdC90L7QvNGDINC30LDQv9GA0L7RgdGDLiDQmtCw0LbQtNC+0LzRgyDQvtCx0YrQtdC60YLRgy3Qv9C+0LvRjNC30L7QstCw0YLQtdC70Y4sXG4gICAqINC90LUg0L/RgNC+0YjQtdC00YjQtdC80YMg0YTQuNC70YzRgtGALCDQv9GA0LjRgdCy0LDQuNCy0LDQtdGC0YHRjyDRgdCy0L7QudGB0YLQstC+IGhpZGRlbiA9IHRydWUuXG4gICAqIFxuICAgKiBAcGFyYW0gIHtBcnJheX0gdXNlcnMg0JzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIt0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10LlcbiAgICogQHBhcmFtICB7U3RyaW5nfSB2YWx1ZSDQpNC40LvRjNGC0YBcbiAgICogQHJldHVybiB7QXJyYXl9ICAgICAgINCe0YLRhNC40LvRjNGC0YDQvtCy0LDQvdC90YvQuSDQvNCw0YHRgdC40LIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10LkuXG4gICAqL1xuICBmaWx0ZXJVc2Vycyh1c2VycywgdmFsdWUpIHtcbiAgICBsZXQgcmUgPSBfZ2V0UmVnRXhwKHZhbHVlKTtcblxuICAgIGZvciAobGV0IHVzZXIgb2YgdXNlcnMpIHtcbiAgICAgIGlmIChyZS50ZXN0KHVzZXIubmFtZSkpIHtcbiAgICAgICAgdXNlci5oaWRkZW4gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVzZXIuaGlkZGVuID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlbG9hZCgpO1xuICAgIHJldHVybiB1c2VycztcblxuICAgIC8qKlxuICAgICAqINCS0L7Qt9Cy0YDQsNGJ0LDQtdGCINGA0LXQs9GD0LvRj9GA0L3QvtC1INCy0YvRgNCw0LbQtdC90LjQtSDQtNC70Y8g0YTQuNC70YzRgtGA0LAg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10LlcbiAgICAgKiDRgdC+0LPQu9Cw0YHQvdC+INGB0LvQtdC00YPRjtGJ0LXQvNGDINC/0LDRgtGC0LXRgNC90YM6XG4gICAgICogIDEpINGA0LXQs9C40YHRgtGA0L7QvdC10LfQsNCy0LjRgdC40LzQvjtcbiAgICAgKiAgMikg0LXRgdC70Lgg0YHQu9C+0LLQviDQvdCw0YfQuNC90LDQtdGC0YHRjyDRgdC+INC30L3QsNC60LAgXCIqXCIsINC40YnQtdGCINC/0L7QtNGB0YLRgNC+0LrRgywg0LjQvdCw0YfQtSAtINC/0L4g0L3QsNGH0LDQu9GDINGB0YLRgNC+0LrQuDtcbiAgICAgKiAgMykg0L/RgNC+0LHQtdC7INCyINC30LDQv9GA0L7RgdC1INC+0LfQvdCw0YfQsNC10YIg0L7Qv9C10YDQsNGG0LjRjiBcItCY0JvQmFwiLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdmFsdWUg0JfQsNC/0YDQvtGBLCDQstCy0LXQtNC10L3QvdGL0Lkg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10LxcbiAgICAgKiBAcmV0dXJuIHtSZWdFeHB9ICAgICAgINCg0LXQs9GD0LvRj9GA0L3QvtC1INCy0YvRgNCw0LbQtdC90LjQtVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9nZXRSZWdFeHAodmFsdWUpIHtcbiAgICAgIGxldCBxdWVyaWVzID0gdmFsdWUuc3BsaXQoJyAnKTtcbiAgICAgIGxldCByZSA9ICcnO1xuXG4gICAgICBmb3IgKGxldCBxdWVyeSBvZiBxdWVyaWVzKSB7XG4gICAgICAgIGlmICgvXFx3Ly50ZXN0KHF1ZXJ5KSkge1xuICAgICAgICAgIHJlICs9ICcoJztcbiAgICAgICAgICBpZighL15cXCovLnRlc3QocXVlcnkpKSByZSArPSAnXic7XG4gICAgICAgICAgcmUgKz0gcXVlcnkubWF0Y2goL1xcdysvZ2kpLmpvaW4oJycpO1xuICAgICAgICAgIHJlICs9ICcpJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZSA9IHJlLnJlcGxhY2UoL1xcKVxcKC9nLCAnKXwoJyk7XG4gICAgICByZSA9IG5ldyBSZWdFeHAocmUsICdpJyk7XG5cbiAgICAgIHJldHVybiByZTtcbiAgICB9XG4gIH1cblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVN0b3JlIHtcblxuXHRjb25zdHJ1Y3RvcihuZXdEYXRhKSB7XG5cdFx0dGhpcy5fZGF0YSA9IG5ld0RhdGE7XG5cdH1cblxuXHRnZXQgZGF0YSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZGF0YTtcblx0fVxuXG5cdHNldCBkYXRhKG5ld0RhdGEpIHtcblx0XHR0aGlzLl9kYXRhID0gbmV3RGF0YTtcblx0fVxufSIsImltcG9ydCBBYnN0cmFjdE1vZGVsIGZyb20gJy4vYWJzdHJhY3QtbW9kZWwnO1xuaW1wb3J0IFNlYXJjaEZpZWxkIGZyb20gJy4vYmxvY2tzL3NlYXJjaC1maWVsZCc7XG5pbXBvcnQgVXNlcnNUYWJsZSBmcm9tICcuL2Jsb2Nrcy91c2Vycy10YWJsZSc7XG5pbXBvcnQgRGF0YVN0b3JlIGZyb20gJy4vZGF0YS1zdG9yZSc7XG5pbXBvcnQge2dldE9iamVjdEZyb21BcnJheX0gZnJvbSAnLi91dGlscyc7XG5cbmNsYXNzIEFwcGxpY2F0aW9uIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9tb2RlbCA9IG5ldyBjbGFzcyBleHRlbmRzIEFic3RyYWN0TW9kZWwge1xuICAgICAgZ2V0IHVybFJlYWQoKSB7XG4gICAgICAgIHJldHVybiAnaHR0cHM6Ly9waWthYnUucnUvcGFnZS9pbnRlcnZpZXcvZnJvbnRlbmQvdXNlcnMucGhwJztcbiAgICAgIH1cblxuICAgICAgZ2V0IHVybFJlYWRPcHRpb25zKCkge1xuICAgICAgICByZXR1cm4geydoZWFkZXJzJzogeydYLUNTUkYtVG9rZW4nOiAnaW50ZXJ2aWV3J319XG4gICAgICB9XG4gICAgfSgpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLl9tb2RlbC5sb2FkKClcbiAgICAgIC50aGVuKFxuICAgICAgICByZXNwb25zZSA9PiB7XG4gICAgICAgICAgdGhpcy51c2VycyA9IG5ldyBEYXRhU3RvcmUocmVzcG9uc2UpO1xuICAgICAgICAgIHRoaXMuX3NlYXJjaEZpZWxkID0gbmV3IFNlYXJjaEZpZWxkKCk7XG4gICAgICAgICAgdGhpcy5fdXNlcnNUYWJsZSA9IG5ldyBVc2Vyc1RhYmxlKCk7XG5cbiAgICAgICAgICB0aGlzLl9zZWFyY2hGaWVsZC5pbml0KCk7XG4gICAgICAgICAgdGhpcy5fdXNlcnNUYWJsZS5pbml0KCk7XG4gICAgICAgIH0pXG5cbiAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZmlsdGVyVXNlcnModmFsdWUpIHtcbiAgICB0aGlzLnVzZXJzLmRhdGEgPSB0aGlzLl91c2Vyc1RhYmxlLmZpbHRlclVzZXJzKHRoaXMudXNlcnMuZGF0YSwgdmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqINCf0L7Qu9GD0YfQsNC10YIg0L3QvtCy0YvQuSDQv9C+0YDRj9C00L7QuiDRjdC70LXQvNC10L3RgtC+0LIg0L7RgiDQv9GA0LXQtNGB0YLQsNCy0LvQtdC90LjQuSDQuCDQvtCx0L3QvtCy0LvRj9C10YIg0LzQsNGB0YHQuNCyINC00LDQvdC90YvRhVxuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgICBkYXRhTmFtZSDQndCw0LjQvNC10L3QvtCy0LDQvdC40LUg0LzQsNGB0YHQuNCy0LAg0LTQsNC90L3Ri9GFINCyIEFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSAge05PREUgTGlzdH0gZWxlbWVudHMg0JrQvtC70LvQtdC60YbQuNGPINGN0LvQtdC80LXQvdGC0L7QslxuICAgKiBAcmV0dXJuIHtudWxsfVxuICAgKi9cbiAgcmVsb2FkRWxlbWVudHMoZGF0YU5hbWUsIGVsZW1lbnRzKSB7XG4gICAgbGV0IG5ld0RhdGEgPSBbXTtcblxuICAgIGlmIChkYXRhTmFtZSA9PT0gJ3VzZXJzJykge1xuICAgICAgZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCwgaSkgPT4ge1xuICAgICAgICBsZXQgaWQgPSArZWxlbWVudC5kYXRhc2V0LmlkO1xuICAgICAgICBsZXQgdXNlciA9IGdldE9iamVjdEZyb21BcnJheSh0aGlzLnVzZXJzLmRhdGEsICdpZCcsIGlkKTtcbiAgICAgICAgbmV3RGF0YS5wdXNoKHVzZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMudXNlcnMuZGF0YSA9IG5ld0RhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGF0YU5hbWUgaXMgbm90IGV4aXN0Jyk7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGFwcCA9IG5ldyBBcHBsaWNhdGlvbigpO1xuZXhwb3J0IGRlZmF1bHQgYXBwOyIsIi8qKlxuICog0KHRgtCw0YDQsNC70YHRjyDQv9GA0LjQtNC10YDQttC40LLQsNGC0YzRgdGPINGI0LDQsdC70L7QvdCwIE1WQywg0L3QviDRgtCw0Log0LrQsNC6INC+0L/Ri9GC0L7QvCDQsiDQv9C+0YHRgtGA0L7QtdC90LjQuFxuICog0LDRgNGF0LjRgtC10LrRgtGD0YDRiyDQv9GA0LjQu9C+0LbQtdC90LjRjyDRjyDQv9C+0YXQstCw0YHRgtCw0YLRjNGB0Y8g0L3QtSDQvNC+0LPRgywg0LzQtdGB0YLQsNC80Lgg0LzQvtCz0YPRgiDQsdGL0YLRjFxuICog0L3QtdC60L7RgtC+0YDRi9C1INC+0YLQutC70L7QvdC10L3QuNGPLiDQktC+0YIg0LrRgNCw0YLQutC+0LUg0L7Qv9C40YHQsNC90LjQtSDQstC30LDQuNC80L7QtNC10LnRgdGC0LLQuNGPINC80L7QtNGD0LvQtdC5OlxuICpcbiAqIDEuIG1haW4uanMg0LjQvdC40YbQuNCw0LvQuNC30LjRgNGD0LXRgiDQv9GA0LjQu9C+0LbQtdC90LjQtS5cbiAqIDIuIGFwcGxpY2F0aW9uLmpzIC0g0LPQu9Cw0LLQvdGL0Lkg0YPQv9GA0LDQstC70Y/RjtGJ0LjQuSDQvNC+0LTRg9C70YwuINCe0L0g0LjQvdC40YbQuNCw0LvQuNC30LjRgNGD0LXRgiDQstGB0LVcbiAqICAgINC90LXQvtCx0YXQvtC00LjQvNGL0LUg0LzQvtC00LXQu9C4INC4INC60L7QvdGC0YDQvtC70LvQtdGA0Ysg0LHQu9C+0LrQvtCyLCDQutC+0YLQvtGA0YvQtSDQsiDRgdCy0L7RjiDQvtGH0LXRgNC10LTRjFxuICogICAg0YHQvtC30LTQsNGO0YIg0L/RgNC10LTRgdGC0LDQstC70LXQvdC40Y8g0YHQstC+0LjRhSDQsdC70L7QutC+0LIuINCi0LDQutC20LUg0LTQsNC90L3Ri9C5INC80L7QtNGD0LvRjFxuICogICAg0L7QsdC10YHQv9C10YfQuNCy0LDQtdGCINC+0LHQvNC10L0g0LTQsNC90L3Ri9C80Lgg0LzQtdC20LTRgyDQvNC+0LTQtdC70Y/QvNC4INC4INCx0LvQvtC60LDQvNC4LlxuICogMy4gYWJzdHJhY3Qtdmlldy5qcyAtINCw0LHRgdGC0YDQsNC60YLQvdC+0LUg0L/RgNC10LTRgdGC0LDQstC70LXQvdC40LUsINC+0YIg0LrQvtGC0L7RgNC+0LPQviDQvdCw0YHQu9C10LTRg9GO0YLRgdGPXG4gKiAgICDQv9GA0LXQtNGB0YLQsNCy0LvQtdC90LjRjyDQsdC70L7QutC+0LIuXG4gKiA0LiBhYnN0cmFjdC1tb2RlbC5qcyAtINCw0LHRgdGC0YDQsNC60YLQvdCw0Y8g0LzQvtC00LXQu9GMLlxuICogNS4gYmxvY2tzLyDRgdC+0LTQtdGA0LbQuNGCINGD0L/RgNCw0LLQu9GP0Y7RidC40LUg0LzQvtC00YPQu9C4INCx0LvQvtC60L7QsiDQuCDQuNGFINC/0YDQtdC00YHRgtCw0LLQu9C10L3QuNGPLlxuICovXG5cbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuL2FwcGxpY2F0aW9uJztcblxuQXBwbGljYXRpb24uaW5pdCgpOyJdLCJuYW1lcyI6WyJBcHBsaWNhdGlvbiJdLCJtYXBwaW5ncyI6Ijs7O0NBQWUsTUFBTSxhQUFhLENBQUM7O0NBRW5DLENBQUMsSUFBSSxPQUFPLEdBQUc7Q0FDZixFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztDQUM3QyxFQUFFOztDQUVGLENBQUMsSUFBSSxjQUFjLEdBQUc7Q0FDdEIsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Q0FDN0MsRUFBRTs7Q0FFRixDQUFDLElBQUksR0FBRztDQUNSLEVBQUUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJ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
