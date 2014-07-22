/**
 * Created by iso.amon on 05.05.2014.
 */

;
(function (EventBus) {

    EventBus.Event = function Event(name) {
        this.name = name;
    };

    EventBus.Event.prototype.getData = function () {
        var result = {};

        for (var property in this) {
            if (this.hasOwnProperty(property) && property !== "name") {
                result[property] = this[property];
            }
        }

        return result;
    };

}(engisEventBus));
