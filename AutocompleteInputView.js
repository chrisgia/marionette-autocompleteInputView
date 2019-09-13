import { View } from 'backbone.marionette';
import tpl from './AutocompleteInputView.html';
import './AutocompleteInputView.scss';

// for IE11 support
import "isomorphic-fetch";

export default View.extend({
  template: tpl,

  initialize() {
    this.channel = Backbone.Radio.channel(this.model.get('channelName'));
  },

  id() {
    return this.model.get('id');
  },

  ui() {
    return {
      'autocompleteInputViewContainer' : '.autocompleteInputView',
      'input' : `#${this.model.get('id')}`,
      'results' : `#${this.model.get('id')}Results`
    }
  },

  events: {
    'focusin @ui.input' : 'onInputFocusin',
    'focusout @ui.autocompleteInputViewContainer' : 'onViewFocusout',
    'input @ui.input' : 'onInput',
    'click .clearInput' : 'onClearInputClick',
    'change @ui.results': 'onOptionSelection'
  },

  onOptionSelection(e){
    // set value of the selected option
    let value = this.getUI('results').find('option:selected')[0].value;
    this.inputValTemp = value;
    this.getUI('input').val(value);
    // trigger event when option is selected in case additional stuff needs to be done
    this.channel.trigger('autocompleteInput:selected', { inputId: this.model.get('id'), value});
  },

  onInput(){
    this.getUI('results').empty();
    let inputVal = this.getUI('input').val().toLowerCase();

    // maybe add regex match for each word separated by space in input ?
    let regex = new RegExp(inputVal, "g");
    let filteredResults = this.model.get('data').filter(element => element.toLowerCase().match(regex));

    let disabled = '';
    // if there are no results, the custom "no results" text is output
    if(filteredResults.length === 0) { filteredResults.push(this.model.get('texts').noResults); disabled = 'disabled' }

    for(let i = 0; i < this.model.get('resultsLimit'); i++){
      if(filteredResults[i]) { this.getUI('results').append(`<option value="${filteredResults[i]}" ${disabled}>${filteredResults[i]}</option>`); } else { break; }
    }

    // set the size of the select box
    if(filteredResults.length < this.model.get('resultsLimit')){
      this.getUI('results').attr('size', filteredResults.length);
    } else {
      this.getUI('results').attr('size', this.model.get('resultsLimit'));
    }
  },

  async onInputFocusin() {
    // displays loading text before showing results list
    this.inputValTemp = this.getUI('input').val();
    this.getUI('input').css('font-style', 'italic');
    this.getUI('input').val(this.model.get('texts').loadingData);
    // prevent user from typing while loading text is shown
    this.getUI('input').keypress((e) => e.preventDefault());
    // this is used to fetch the data only when the input gets focused after rendering, so the data doesnt get fetched directly at every render (useful for huge data, because otherwise it will slow down the rendering)
    if(this.model.get('data').length === 0 && this.model.get('controllerURL') != ''){
      const source = await fetch(this.model.get('controllerURL'));
      this.model.set('data', await source.json());
    }

    // sets input field back to initial value and style
    this.getUI('input').css('font-style', 'normal');
    this.getUI('input').val(this.inputValTemp);
    // show results select box
    this.getUI('results')[0].className = this.getUI('results')[0].className.replace('d-none', 'd-block');
    // revert user typing prevention
    this.getUI('input').unbind("keypress");
    // call the function which filters out the data with the users search input
    this.onInput();
  },

  onViewFocusout(event) {
    // hide results if the focus is neither on the input nor the results select box
    if (this.getUI('autocompleteInputViewContainer')[0].contains(event.relatedTarget)) {
      return;
    }
    this.getUI('results')[0].className = this.getUI('results')[0].className.replace('d-block', 'd-none');
    this.getUI('input').val(this.inputValTemp);
  },

  onClearInputClick() {
    this.getUI('input').val('');
    // trigger event when input is cleared in case additional stuff needs to be done
    this.channel.trigger('autocompleteInput:cleared', this.model.get('id'));
  }
});
