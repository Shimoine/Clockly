import Button from 'react-bootstrap/Button';

function GoogleAuth() {
}

function PageOfSettings() {
    return (
        <div>
            <h1>設定</h1>
            <Button variant="outline-success" onClick={GoogleAuth}>
                Google Calendar を認証
            </Button>
        </div>
    );
}
export default PageOfSettings;
