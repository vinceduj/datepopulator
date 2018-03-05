/**
 * Created by: vincenduj
 *
 * @param params {Object}
 *  Must contain the following properties:
 *    date_id : {string} element id for date select,
 *    hour_id : {string} element id for hour select,
 *    date_am : {array} [start hour, start minutes, end hour, end minutes] for the morning,
 *    date_pm : {array} [...] same as morning for the afternoon,
 *    t_gap : {int} gap in minutes between hours,
 *    n_days : {int} number of days,
 *    only_business : {boolean} whether to skip non business days,
 *    days_names : {array} translated days names (keyed by the day number returned by Date::getDay())
 * @constructor {}
 */
function DatePopulator(params) {
    this.DP = {
        date_id: params.date_id,
        hour_id: params.hour_id,
        date_am: params.date_am,
        date_pm: params.date_pm,
        t_gap: params.t_gap,
        n_days: params.n_days,
        only_business: params.only_business,
        days_names: params.days_names,
        fn: {}
    };
    var DP = this.DP;
    /**
     * @param $date {Date}
     * @returns {Array}
     */
    DP.fn.getDays = function ($date) {
        var days = [];
        var $now = new Date();
        while (days.length < DP.n_days) {
            // Skip non business days.
            if (DP.only_business) {
                if ($date.getDay() == 0 || $date.getDay() == 6) {
                    $date.setDate($date.getDate() + 1);
                    continue;
                }
            }
            // If first day is the same day, check hours.
            if (days.length == 0 && $date.getDate() == $now.getDate()) {
                $now.setHours(DP.date_pm[2], DP.date_pm[3], 0, 0);
                if ($date.getTime() >= $now.getTime()) {
                    $date.setDate($date.getDate() + 1);
                    continue;
                }
            }
            var time = $date.getTime();
            days.push(new Date(time));
            $date.setDate($date.getDate() + 1);
        }
        return days;
    };
    /**
     * @param day {int}
     * @returns {string}
     */
    DP.fn.getTranslatedDay = function (day) {
        return DP.days_names[day];
    };
    /**
     * @param value {int}
     * @returns {string}
     */
    DP.fn.twoDigits = function (value) {
        return (value < 10) ? "0" + value : "" + value;
    };
    /**
     * @param $date {Date}
     * @param separator {string}
     * @param reverse {boolean}
     * @returns {string}
     */
    DP.fn.getFormattedDate = function ($date, separator, reverse) {
        var arrDate = [
            $date.getFullYear(),
            DP.fn.twoDigits($date.getMonth() + 1),
            DP.fn.twoDigits($date.getDate())
        ];
        if (reverse === true) {
            arrDate = arrDate.reverse();
        }
        return arrDate.join(separator);
    };
    /**
     * @param $date {Date}
     * @returns {boolean}
     */
    DP.fn.isImmediate = function ($date) {
        var ref_time = $date.getTime();
        $date.setHours(DP.date_am[0], DP.date_am[1], 0, 0);
        var t1 = $date.getTime();
        $date.setHours(DP.date_am[2], DP.date_am[3], 0, 0);
        var t2 = $date.getTime();
        $date.setHours(DP.date_pm[0], DP.date_pm[1], 0, 0);
        var t3 = $date.getTime();
        $date.setHours(DP.date_pm[2], DP.date_pm[3], 0, 0);
        var t4 = $date.getTime();
        if ((ref_time > t1 && ref_time < t2) || (ref_time > t3 && ref_time < t4)) {
            return true;
        }
        return false;
    };

    this.populateDays = function () {
        var list = document.getElementById(DP.date_id);
        var $now = new Date();
        var days = DP.fn.getDays(new Date());
        var opts = [];

        // Append days.
        for (var i in days) {
            opt = document.createElement('option');
            opt.value = DP.fn.getFormattedDate(days[i], "-", false);
            opt.text = DP.fn.getFormattedDate(days[i], "/", true) + " " + DP.fn.getTranslatedDay(days[i].getDay());
            opts.push(opt);
            list.appendChild(opt);
        }

        this.populateHours(opts[0].getAttribute('value'));
    };

    this.populateHours = function (value) {
        var list = document.getElementById(DP.hour_id);
        list.innerHTML = null;

        var refDate = new Date(value);
        var maxDate = new Date(value);
        var usrDate = new Date();
        var setHours = function (t) {
            refDate.setHours(t[0], t[1], 0, 0);
            maxDate.setHours(t[2], t[3], 1, 0);
            while (refDate.getTime() < maxDate.getTime()) {
                if (usrDate.getTime() < refDate.getTime()) {
                    var opt = document.createElement('option');
                    var text = DP.fn.twoDigits(refDate.getHours()) + "h" + DP.fn.twoDigits(refDate.getMinutes());
                    opt.value = text;
                    opt.text = text;
                    list.appendChild(opt);
                }
                refDate.setMinutes(refDate.getMinutes() + DP.t_gap);
            }
        };

        setHours(DP.date_am);
        setHours(DP.date_pm);
    };
}
