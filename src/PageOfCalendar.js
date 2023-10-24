import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment)

function PageOfCalendar() {
    return (
        <div>
            <Calendar
            localizer={localizer}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
            />
        </div>
    );
}
export default PageOfCalendar;
