# Marionette-AutocompleteInputView
## Usage example:

* JavaScript: 
```javascript
    import { View } from 'backbone.marionette';
    import { Model } from 'backbone';

    const yourRadioChannel = Backbone.Radio.channel('yourChannelName');

    // Import the View
    import { AutocompleteInputView } from './marionette-autocompleteInputView';

    export default View.extend({
        template: tpl,

        // this can be used to listen to the events triggered by the AutocompleteInputView
        initialize(){
            this.listenTo(yourRadioChannel, 'autocompleteInput:cleared', this.onAutocompleteInputCleared);
            this.listenTo(yourRadioChannel, 'autocompleteInput:selected', this.onAutocompleteInputSelected);
        },

        // Set up a region where the input should be rendered
        regions: {
            autocompleteInput: '#autocompleteInput'
        },

        // Attach the autocomplete input field to your view on Render
        onRender() {
            this.showChildView('autocompleteInput', 
                new AutocompleteInputView({
                    model: new Model.extend({
                        // the id of the input that will be created
                        id: 'testAutocompleteInput',
                        // pass the data directly to the view
                        data: [],
                        // URL to fetch data externally (with optional GET parameters)
                        controllerURL: 'url-to/controller?getParam1=test&getParam2=test',
                        // customize output texts
                        texts: {
                            inputLabel: 'Autocomplete Input Test',
                            noResults: 'Sadly, there are no results :(',
                            loadingData: 'Booting up..'
                        },
                        // the initial value of the input
                        initialValue: 'Hello World!',
                        // limit the number of output results
                        resultsLimit: 5,
                        // disable the input (readonly mode..)
                        disabled: false,
                        // the name of the channel where changes should be triggered (clearing the input and selecting an option)
                        channelName: 'yourChannelName'
                    });
                })
            );
        }
    }
```

* HTML:
``` html
<!-- Set up a div in the form where the input should be inserted -->
<form>
    <div id="autocompleteInput"><!-- The AutocompleteInputView will be inserted here --></div>
</form>
```