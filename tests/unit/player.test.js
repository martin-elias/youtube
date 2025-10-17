/**
 * @jest-environment jsdom
 */

jest.mock('../../js&css/extension/core', () => ({
    storage: {},
    elements: {},
    regex: {},
    isset: () => false,
    messages: { send: jest.fn() },
}));

const coreMock = require('../../js&css/extension/core');
global.ImprovedTube = coreMock;

require('../../js&css/web-accessible/www.youtube.com/player.js');

describe('player.js integration', () => {
    test('should attach main player functions', () => {
        expect(typeof ImprovedTube.autoplayDisable).toBe('function');
        expect(typeof ImprovedTube.playbackSpeed).toBe('function');
        expect(typeof ImprovedTube.playerQuality).toBe('function');
        expect(typeof ImprovedTube.playerVolume).toBe('function');
    });

    test('should attach layout-related functions', () => {
        expect(typeof ImprovedTube.toggleFitToWindow).toBe('function');
        expect(typeof ImprovedTube.mini_player__setSize).toBe('function');
    });

    test('autoplayDisable should not throw', () => {
        expect(() => ImprovedTube.autoplayDisable({})).not.toThrow();
    });

    test('playbackSpeed modifies playbackRate if available', () => {
        const video = { playbackRate: 1 };
        ImprovedTube.elements.video = video;
        ImprovedTube.playbackSpeed(2);
        expect(video.playbackRate).toBe(2);
    });

    test('playerVolume sets volume safely', () => {
        const player = { setVolume: jest.fn() };
        ImprovedTube.elements.player = player;
        ImprovedTube.storage = { player_forced_volume: true, player_volume: 70 };
        ImprovedTube.playerVolume();
        expect(player.setVolume).toHaveBeenCalledWith(100);
    });

    test('playerQuality should handle missing API gracefully', () => {
        expect(() => ImprovedTube.playerQuality()).not.toThrow();
    });

    test('toggleFitToWindow toggles the it-player-size attribute', () => {
        const html = document.createElement('html');
        document.querySelector = () => html;
        ImprovedTube.storage.player_size = 'fit_to_window';
        ImprovedTube.toggleFitToWindow();
        expect(html.getAttribute('it-player-size')).toBe('fit_to_window');
    });

    test('mini_player__setSize applies width and height', () => {
        const el = document.createElement('div');
        ImprovedTube.elements.player = el;
        ImprovedTube.mini_player__setSize(200, 100);
        expect(el.style.width).toBe('200px');
        expect(el.style.height).toBe('100px');
    });

    test('playerQuality and playerVolume are callable repeatedly', () => {
        ImprovedTube.elements.player = { setVolume: jest.fn() };

        expect(() => {
            ImprovedTube.playerQuality();
            ImprovedTube.playerVolume();
            ImprovedTube.playerVolume();
        }).not.toThrow();
    });

    test('playbackSpeed ignores invalid input', () => {
        const video = { playbackRate: 1 };
        ImprovedTube.elements.video = video;
        expect(() => ImprovedTube.playbackSpeed('fast')).not.toThrow();
    });

    test('playerVolume handles missing player gracefully', () => {
        ImprovedTube.elements.player = { setVolume: jest.fn() };
        expect(() => ImprovedTube.playerVolume()).not.toThrow();
    });

    test('playerVolume handles volume > 100 without crashing', () => {
        ImprovedTube.elements.player = { setVolume: jest.fn() };
        ImprovedTube.storage = { player_forced_volume: true, player_volume: 150 };
        expect(() => ImprovedTube.playerVolume()).not.toThrow();
    });

    test('playbackSpeed logs error when playbackRate cannot be established', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        delete ImprovedTube.elements.video;
        expect(() => ImprovedTube.playbackSpeed()).not.toThrow();
        spy.mockRestore();
    });

    test('toggleFitToWindow handles missing html element safely', () => {
        const fakeHtml = {
            getAttribute: jest.fn().mockReturnValue('do_not_change'),
            setAttribute: jest.fn()
        };
        document.querySelector = () => fakeHtml;
        expect(() => ImprovedTube.toggleFitToWindow()).not.toThrow();
    });

    test('autoplayDisable handles multiple autoplay flags', () => {
        const video = {};
        const fakePlayer = {
            classList: { contains: () => false },
        };
        ImprovedTube.elements.player = fakePlayer;
        ImprovedTube.regex.channel = /channel/;
        ImprovedTube.storage = {
            player_autoplay_disable: true,
            playlist_autoplay: false,
            channel_trailer_autoplay: false
        };
        expect(() => ImprovedTube.autoplayDisable(video)).not.toThrow();
    });

    test('mini_player__setSize handles non-numeric inputs safely', () => {
        const el = document.createElement('div');
        ImprovedTube.elements.player = el;
        expect(() => ImprovedTube.mini_player__setSize('auto', 'auto')).not.toThrow();
    });

    test('playerVolume handles player_forced_volume disabled', () => {
        const player = { setVolume: jest.fn() };
        ImprovedTube.elements.player = player;
        ImprovedTube.storage = { player_forced_volume: false, player_volume: 50 };
        expect(() => ImprovedTube.playerVolume()).not.toThrow();
    });

    test('toggleFitToWindow toggles back from fit_to_window', () => {
        const html = document.createElement('html');
        html.setAttribute('it-player-size', 'fit_to_window');
        document.querySelector = () => html;
        ImprovedTube.storage.player_size = 'fit_to_window';
        expect(() => ImprovedTube.toggleFitToWindow()).not.toThrow();
    });

    test('playbackSpeed ignores invalid numeric input gracefully', () => {
        const video = { playbackRate: 1 };
        ImprovedTube.elements.video = video;
        expect(() => ImprovedTube.playbackSpeed(NaN)).not.toThrow();
    });

    test('playerQuality can run multiple times without breaking', () => {
        expect(() => {
            ImprovedTube.playerQuality();
            ImprovedTube.playerQuality();
            ImprovedTube.playerQuality();
        }).not.toThrow();
    });

    test('playerVolume creates audioContext when missing', () => {
        ImprovedTube.audioContext = null;
        ImprovedTube.elements.player = { setVolume: jest.fn() };
        ImprovedTube.storage = { player_forced_volume: false, player_volume: 20 };
        expect(() => ImprovedTube.playerVolume()).not.toThrow();
        expect('audioContext' in ImprovedTube).toBe(true);
    });

    test('mini_player__setSize handles zero or negative values safely', () => {
        const el = document.createElement('div');
        ImprovedTube.elements.player = el;
        expect(() => ImprovedTube.mini_player__setSize(0, -50)).not.toThrow();
    });

});
